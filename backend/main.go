package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/go-sql-driver/mysql"
	"golang.org/x/crypto/bcrypt"
)

var db *sql.DB

func main() {
	initDB()
	defer db.Close()

	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Auth
	r.POST("/api/register", registerHandler)
	r.POST("/api/login", loginHandler)

	// Aktivitas siswa (real-time)
	r.POST("/api/update-activity", updateActivityHandler)
	r.GET("/api/active-students", getActiveStudentsHandler)

	// Data master
	r.GET("/api/mata-pelajaran", getMataPelajaranHandler)

	// Ujian (guru)
	r.POST("/api/ujian", createUjianHandler)
	r.GET("/api/total-ujian", getTotalUjianHandler)
	r.GET("/api/total-siswa", getTotalSiswaHandler)
	r.GET("/api/ujian/list", getUjianListHandler)
	r.GET("/api/ujian/:id", getUjianDetailHandler)

	// Siswa
	r.GET("/api/siswa/ujian-tersedia", getUjianTersediaHandler)
	r.GET("/api/siswa/ujian/:id", getSoalUjianHandler)
	r.POST("/api/siswa/submit-jawaban", submitJawabanHandler)
	r.GET("/api/siswa/riwayat/:siswaId", getRiwayatSiswaHandler)
	r.GET("/api/siswa/hasil/:id", getDetailHasilHandler)
	r.GET("/api/siswa/rata-rata/:siswaId", getRataRataHandler)
	r.DELETE("/api/siswa/hapus-riwayat/:id", deleteRiwayatHandler)

	// Guru: semua nilai siswa
	r.GET("/api/guru/semua-nilai", getAllNilaiSiswaHandler)

	// Guru: monitoring siswa (folder per siswa)
	r.GET("/api/guru/semua-siswa", getAllSiswaHandler)
	r.GET("/api/guru/detail-siswa/:siswaId", getDetailSiswaHandler)

	log.Println("Server running on http://localhost:8080")
	r.Run(":8080")
}

// ==================== DATABASE INIT ====================
func initDB() {
	var err error
	dsn := "root:@tcp(localhost:3306)/ujian_digital?charset=utf8mb4&parseTime=True&loc=Local"
	db, err = sql.Open("mysql", dsn)
	if err != nil {
		log.Fatal("Gagal koneksi ke database: ", err)
	}
	if err = db.Ping(); err != nil {
		log.Fatal("Database tidak merespon: ", err)
	}
	log.Println("Connected to MySQL")

	// Users
	_, _ = db.Exec(`CREATE TABLE IF NOT EXISTS users (
		id INT AUTO_INCREMENT PRIMARY KEY,
		name VARCHAR(100) NOT NULL,
		email VARCHAR(100) UNIQUE NOT NULL,
		password VARCHAR(255) NOT NULL,
		role ENUM('siswa','guru') NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	)`)

	// User sessions
	_, _ = db.Exec(`CREATE TABLE IF NOT EXISTS user_sessions (
		id INT AUTO_INCREMENT PRIMARY KEY,
		user_id INT NOT NULL UNIQUE,
		last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
		FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
	)`)

	// Mata pelajaran
	_, _ = db.Exec(`CREATE TABLE IF NOT EXISTS mata_pelajaran (
		id INT AUTO_INCREMENT PRIMARY KEY,
		nama VARCHAR(100) NOT NULL UNIQUE
	)`)
	var count int
	db.QueryRow("SELECT COUNT(*) FROM mata_pelajaran").Scan(&count)
	if count == 0 {
		_, _ = db.Exec(`
			INSERT INTO mata_pelajaran (nama) VALUES
			('Pendidikan Agama Islam (PAI) - Al-Qur''an Hadis'),
			('PAI - Akidah Akhlak'),
			('PAI - Fikih'),
			('PAI - Sejarah Kebudayaan Islam (SKI)'),
			('Bahasa Arab'),
			('Bahasa Indonesia'),
			('Bahasa Inggris'),
			('Matematika'),
			('Ilmu Pengetahuan Alam (IPA)'),
			('Ilmu Pengetahuan Sosial (IPS)'),
			('Pendidikan Pancasila dan Kewarganegaraan (PPKn)'),
			('Seni Budaya'),
			('Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)'),
			('Prakarya/Informatika')
		`)
	}

	// Ujian
	_, _ = db.Exec(`CREATE TABLE IF NOT EXISTS ujian (
		id INT AUTO_INCREMENT PRIMARY KEY,
		judul VARCHAR(200) NOT NULL,
		mata_pelajaran_id INT NOT NULL,
		durasi INT NOT NULL,
		created_by INT NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (mata_pelajaran_id) REFERENCES mata_pelajaran(id),
		FOREIGN KEY (created_by) REFERENCES users(id)
	)`)

	// Soal (tambah kolom penjelasan)
	_, _ = db.Exec(`CREATE TABLE IF NOT EXISTS soal (
		id INT AUTO_INCREMENT PRIMARY KEY,
		ujian_id INT NOT NULL,
		teks TEXT NOT NULL,
		tipe ENUM('pilihan_ganda','essai') NOT NULL,
		pilihan_a TEXT,
		pilihan_b TEXT,
		pilihan_c TEXT,
		pilihan_d TEXT,
		jawaban_benar TEXT,
		penjelasan TEXT,
		FOREIGN KEY (ujian_id) REFERENCES ujian(id) ON DELETE CASCADE
	)`)
	// Cek dan tambah kolom penjelasan jika belum ada (untuk migrasi)
	_, _ = db.Exec(`ALTER TABLE soal ADD COLUMN IF NOT EXISTS penjelasan TEXT`)

	// Hasil ujian (nilai siswa) dengan kolom jawaban_detail
	_, _ = db.Exec(`CREATE TABLE IF NOT EXISTS hasil_ujian (
		id INT AUTO_INCREMENT PRIMARY KEY,
		siswa_id INT NOT NULL,
		ujian_id INT NOT NULL,
		nilai INT,
		tanggal TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		jawaban_detail TEXT,
		FOREIGN KEY (siswa_id) REFERENCES users(id),
		FOREIGN KEY (ujian_id) REFERENCES ujian(id)
	)`)
	_, _ = db.Exec(`ALTER TABLE hasil_ujian ADD COLUMN IF NOT EXISTS jawaban_detail TEXT`)

	log.Println("All tables ready")
}

// ==================== AUTH ====================
func registerHandler(c *gin.Context) {
	var req struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Password string `json:"password"`
		Role     string `json:"role"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request"})
		return
	}
	if req.Name == "" || req.Email == "" || req.Password == "" || (req.Role != "siswa" && req.Role != "guru") {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Semua field harus diisi dan role harus siswa/guru"})
		return
	}
	hashed, _ := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	_, err := db.Exec("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
		req.Name, req.Email, string(hashed), req.Role)
	if err != nil {
		if err.Error() == "Error 1062: Duplicate entry" {
			c.JSON(http.StatusConflict, gin.H{"message": "Email sudah terdaftar"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Database error"})
		}
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Registrasi berhasil", "data": gin.H{"name": req.Name, "email": req.Email, "role": req.Role}})
}

func loginHandler(c *gin.Context) {
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request"})
		return
	}
	var user struct {
		ID       int
		Name     string
		Email    string
		Password string
		Role     string
	}
	err := db.QueryRow("SELECT id, name, email, password, role FROM users WHERE email = ?", req.Email).
		Scan(&user.ID, &user.Name, &user.Email, &user.Password, &user.Role)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Email atau password salah"})
		return
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Email atau password salah"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Login berhasil", "data": gin.H{
		"id": user.ID, "name": user.Name, "email": user.Email, "role": user.Role,
	}})
}

// ==================== AKTIVITAS SISWA ====================
func updateActivityHandler(c *gin.Context) {
	var req struct{ UserID int `json:"userId"` }
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request"})
		return
	}
	_, err := db.Exec(`INSERT INTO user_sessions (user_id, last_activity) VALUES (?, NOW()) ON DUPLICATE KEY UPDATE last_activity = NOW()`, req.UserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to update activity"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "ok"})
}

func getActiveStudentsHandler(c *gin.Context) {
	rows, err := db.Query(`
		SELECT u.id, u.name, u.email, s.last_activity
		FROM users u
		JOIN user_sessions s ON u.id = s.user_id
		WHERE u.role = 'siswa' AND s.last_activity > DATE_SUB(NOW(), INTERVAL 5 MINUTE)
		ORDER BY s.last_activity DESC
	`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Database error"})
		return
	}
	defer rows.Close()
	var students []gin.H
	for rows.Next() {
		var id int
		var name, email string
		var lastActivity time.Time
		rows.Scan(&id, &name, &email, &lastActivity)
		students = append(students, gin.H{
			"id": id, "name": name, "email": email,
			"lastActivity": lastActivity.Format("15:04:05"),
		})
	}
	c.JSON(http.StatusOK, gin.H{"data": students})
}

// ==================== MATA PELAJARAN ====================
func getMataPelajaranHandler(c *gin.Context) {
	rows, err := db.Query("SELECT id, nama FROM mata_pelajaran ORDER BY nama")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Database error"})
		return
	}
	defer rows.Close()
	var list []gin.H
	for rows.Next() {
		var id int
		var nama string
		rows.Scan(&id, &nama)
		list = append(list, gin.H{"id": id, "nama": nama})
	}
	c.JSON(http.StatusOK, gin.H{"data": list})
}

// ==================== UJIAN (GURU) ====================
func createUjianHandler(c *gin.Context) {
	var req struct {
		Judul           string `json:"judul"`
		MataPelajaranID int    `json:"mataPelajaranId"`
		Durasi          int    `json:"durasi"`
		CreatedBy       int    `json:"createdBy"`
		Soal            []struct {
			Teks         string `json:"teks"`
			Tipe         string `json:"tipe"`
			PilihanA     string `json:"pilihanA"`
			PilihanB     string `json:"pilihanB"`
			PilihanC     string `json:"pilihanC"`
			PilihanD     string `json:"pilihanD"`
			JawabanBenar string `json:"jawabanBenar"`
			Penjelasan   string `json:"penjelasan"`
		} `json:"soal"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request"})
		return
	}
	if req.Judul == "" || req.MataPelajaranID == 0 || req.Durasi == 0 || req.CreatedBy == 0 || len(req.Soal) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Data tidak lengkap"})
		return
	}
	tx, _ := db.Begin()
	res, err := tx.Exec("INSERT INTO ujian (judul, mata_pelajaran_id, durasi, created_by) VALUES (?, ?, ?, ?)",
		req.Judul, req.MataPelajaranID, req.Durasi, req.CreatedBy)
	if err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to create exam"})
		return
	}
	ujianID, _ := res.LastInsertId()
	for _, s := range req.Soal {
		_, err = tx.Exec(`INSERT INTO soal (ujian_id, teks, tipe, pilihan_a, pilihan_b, pilihan_c, pilihan_d, jawaban_benar, penjelasan)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			ujianID, s.Teks, s.Tipe, s.PilihanA, s.PilihanB, s.PilihanC, s.PilihanD, s.JawabanBenar, s.Penjelasan)
		if err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to insert question"})
			return
		}
	}
	tx.Commit()
	c.JSON(http.StatusCreated, gin.H{"message": "Ujian created", "id": ujianID})
}

func getTotalUjianHandler(c *gin.Context) {
	var total int
	db.QueryRow("SELECT COUNT(*) FROM ujian").Scan(&total)
	c.JSON(http.StatusOK, gin.H{"total": total})
}

func getTotalSiswaHandler(c *gin.Context) {
	var total int
	db.QueryRow("SELECT COUNT(*) FROM users WHERE role = 'siswa'").Scan(&total)
	c.JSON(http.StatusOK, gin.H{"total": total})
}

func getUjianListHandler(c *gin.Context) {
	rows, err := db.Query(`
		SELECT u.id, u.judul, mp.nama, u.durasi, u.created_at
		FROM ujian u
		JOIN mata_pelajaran mp ON u.mata_pelajaran_id = mp.id
		ORDER BY u.created_at DESC
	`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Database error"})
		return
	}
	defer rows.Close()
	var list []gin.H
	for rows.Next() {
		var id int
		var judul, mapel string
		var durasi int
		var createdAt string
		rows.Scan(&id, &judul, &mapel, &durasi, &createdAt)
		list = append(list, gin.H{
			"id": id, "judul": judul, "mataPelajaran": mapel,
			"durasi": durasi, "createdAt": createdAt,
		})
	}
	c.JSON(http.StatusOK, gin.H{"data": list})
}

func getUjianDetailHandler(c *gin.Context) {
	id := c.Param("id")
	var ujian struct {
		ID        int
		Judul     string
		Mapel     string
		Durasi    int
		CreatedAt string
	}
	err := db.QueryRow(`
		SELECT u.id, u.judul, mp.nama, u.durasi, DATE_FORMAT(u.created_at, '%Y-%m-%d %H:%i:%s')
		FROM ujian u
		JOIN mata_pelajaran mp ON u.mata_pelajaran_id = mp.id
		WHERE u.id = ?
	`, id).Scan(&ujian.ID, &ujian.Judul, &ujian.Mapel, &ujian.Durasi, &ujian.CreatedAt)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Ujian tidak ditemukan"})
		return
	}
	rows, err := db.Query(`
		SELECT id, teks, tipe, 
		       COALESCE(pilihan_a, ''), COALESCE(pilihan_b, ''), 
		       COALESCE(pilihan_c, ''), COALESCE(pilihan_d, ''), 
		       COALESCE(jawaban_benar, ''), COALESCE(penjelasan, '')
		FROM soal WHERE ujian_id = ?
	`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Database error"})
		return
	}
	defer rows.Close()
	var soalList []gin.H
	for rows.Next() {
		var s struct {
			ID           int
			Teks         string
			Tipe         string
			PilihanA     string
			PilihanB     string
			PilihanC     string
			PilihanD     string
			JawabanBenar string
			Penjelasan   string
		}
		rows.Scan(&s.ID, &s.Teks, &s.Tipe, &s.PilihanA, &s.PilihanB, &s.PilihanC, &s.PilihanD, &s.JawabanBenar, &s.Penjelasan)
		soal := gin.H{
			"id":           s.ID,
			"teks":         s.Teks,
			"tipe":         s.Tipe,
			"jawabanBenar": s.JawabanBenar,
			"penjelasan":   s.Penjelasan,
		}
		if s.Tipe == "pilihan_ganda" {
			soal["pilihanA"] = s.PilihanA
			soal["pilihanB"] = s.PilihanB
			soal["pilihanC"] = s.PilihanC
			soal["pilihanD"] = s.PilihanD
		}
		soalList = append(soalList, soal)
	}
	c.JSON(http.StatusOK, gin.H{
		"id":            ujian.ID,
		"judul":         ujian.Judul,
		"mataPelajaran": ujian.Mapel,
		"durasi":        ujian.Durasi,
		"createdAt":     ujian.CreatedAt,
		"soal":          soalList,
	})
}

// ==================== SISWA (UJIAN TERSEDIA) ====================
func getUjianTersediaHandler(c *gin.Context) {
	siswaId := c.Query("siswaId")
	if siswaId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "siswaId required"})
		return
	}
	query := `
		SELECT u.id, u.judul, mp.nama, u.durasi, u.created_at
		FROM ujian u
		JOIN mata_pelajaran mp ON u.mata_pelajaran_id = mp.id
		WHERE u.id NOT IN (
			SELECT ujian_id FROM hasil_ujian WHERE siswa_id = ?
		)
		ORDER BY u.created_at DESC
	`
	rows, err := db.Query(query, siswaId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Database error"})
		return
	}
	defer rows.Close()
	var list []gin.H
	for rows.Next() {
		var id int
		var judul, mapel string
		var durasi int
		var createdAt string
		rows.Scan(&id, &judul, &mapel, &durasi, &createdAt)
		list = append(list, gin.H{
			"id": id, "judul": judul, "mataPelajaran": mapel,
			"durasi": durasi, "createdAt": createdAt,
		})
	}
	c.JSON(http.StatusOK, gin.H{"data": list})
}

// ==================== SISWA (KERJAKAN UJIAN) ====================
func getSoalUjianHandler(c *gin.Context) {
	id := c.Param("id")
	var durasi int
	err := db.QueryRow("SELECT durasi FROM ujian WHERE id = ?", id).Scan(&durasi)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Ujian tidak ditemukan"})
		return
	}
	rows, err := db.Query(`
		SELECT id, teks, tipe, pilihan_a, pilihan_b, pilihan_c, pilihan_d, jawaban_benar, penjelasan
		FROM soal WHERE ujian_id = ?
	`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Database error"})
		return
	}
	defer rows.Close()
	var soalList []gin.H
	for rows.Next() {
		var soalID int
		var teks, tipe string
		var pA, pB, pC, pD sql.NullString
		var jawabanBenar, penjelasan string
		rows.Scan(&soalID, &teks, &tipe, &pA, &pB, &pC, &pD, &jawabanBenar, &penjelasan)
		soal := gin.H{
			"id": soalID, "teks": teks, "tipe": tipe,
			"jawabanBenar": jawabanBenar, "penjelasan": penjelasan,
		}
		if tipe == "pilihan_ganda" {
			soal["pilihanA"] = pA.String
			soal["pilihanB"] = pB.String
			soal["pilihanC"] = pC.String
			soal["pilihanD"] = pD.String
		}
		soalList = append(soalList, soal)
	}
	c.JSON(http.StatusOK, gin.H{"soal": soalList, "durasi": durasi})
}

func submitJawabanHandler(c *gin.Context) {
	var req struct {
		SiswaID int            `json:"siswaId"`
		UjianID int            `json:"ujianId"`
		Jawaban map[int]string `json:"jawaban"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request"})
		return
	}
	var totalSoal, totalBenar int
	detailList := []map[string]interface{}{}
	for soalID, jawabanUser := range req.Jawaban {
		totalSoal++
		var jawabanBenar, penjelasan string
		err := db.QueryRow("SELECT jawaban_benar, penjelasan FROM soal WHERE id = ?", soalID).Scan(&jawabanBenar, &penjelasan)
		if err != nil {
			continue
		}
		benar := jawabanUser == jawabanBenar
		if benar {
			totalBenar++
		}
		detailList = append(detailList, map[string]interface{}{
			"soalId":       soalID,
			"jawabanUser":  jawabanUser,
			"jawabanBenar": jawabanBenar,
			"benar":        benar,
			"penjelasan":   penjelasan,
		})
	}
	nilai := int(float64(totalBenar) / float64(totalSoal) * 100)
	detailJSON, _ := json.Marshal(detailList)
	_, err := db.Exec(`INSERT INTO hasil_ujian (siswa_id, ujian_id, nilai, tanggal, jawaban_detail) VALUES (?, ?, ?, NOW(), ?)`,
		req.SiswaID, req.UjianID, nilai, string(detailJSON))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal menyimpan nilai"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"nilai": nilai, "detail": detailList})
}

// ==================== RIWAYAT SISWA ====================
func getRiwayatSiswaHandler(c *gin.Context) {
	siswaId := c.Param("siswaId")
	rows, err := db.Query(`
		SELECT h.id, u.judul, mp.nama, h.nilai, h.tanggal
		FROM hasil_ujian h
		JOIN ujian u ON h.ujian_id = u.id
		JOIN mata_pelajaran mp ON u.mata_pelajaran_id = mp.id
		WHERE h.siswa_id = ?
		ORDER BY h.tanggal DESC
	`, siswaId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Database error"})
		return
	}
	defer rows.Close()
	var list []gin.H
	for rows.Next() {
		var id int
		var judul, mapel string
		var nilai int
		var tanggal string
		rows.Scan(&id, &judul, &mapel, &nilai, &tanggal)
		list = append(list, gin.H{
			"id":             id,
			"judul":          judul,
			"mataPelajaran":  mapel,
			"nilai":          nilai,
			"tanggal":        tanggal,
		})
	}
	c.JSON(http.StatusOK, gin.H{"data": list})
}

// ==================== DETAIL HASIL UJIAN (LENGKAP SEPERTI DETAIL GURU) ====================
func getDetailHasilHandler(c *gin.Context) {
	id := c.Param("id")
	var ujianID int
	var nilai int
	var jawabanDetail string
	err := db.QueryRow("SELECT ujian_id, nilai, COALESCE(jawaban_detail, '') FROM hasil_ujian WHERE id = ?", id).Scan(&ujianID, &nilai, &jawabanDetail)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Data tidak ditemukan"})
		return
	}
	var judul, mapel string
	err = db.QueryRow(`
		SELECT u.judul, mp.nama FROM ujian u
		JOIN mata_pelajaran mp ON u.mata_pelajaran_id = mp.id
		WHERE u.id = ?
	`, ujianID).Scan(&judul, &mapel)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Database error"})
		return
	}
	var detail []map[string]interface{}
	if jawabanDetail != "" {
		json.Unmarshal([]byte(jawabanDetail), &detail)
		// Ambil semua data soal (teks, tipe, pilihan, jawaban benar, penjelasan) untuk setiap item
		for i, d := range detail {
			soalID, ok := d["soalId"].(float64)
			if ok {
				var teks, tipe, pilihanA, pilihanB, pilihanC, pilihanD, jawabanBenar, penjelasan string
				err := db.QueryRow(`
					SELECT teks, tipe, 
					       COALESCE(pilihan_a, ''), COALESCE(pilihan_b, ''), 
					       COALESCE(pilihan_c, ''), COALESCE(pilihan_d, ''), 
					       COALESCE(jawaban_benar, ''), COALESCE(penjelasan, '')
					FROM soal WHERE id = ?
				`, int(soalID)).Scan(&teks, &tipe, &pilihanA, &pilihanB, &pilihanC, &pilihanD, &jawabanBenar, &penjelasan)
				if err == nil {
					detail[i]["teks"] = teks
					detail[i]["tipe"] = tipe
					detail[i]["pilihanA"] = pilihanA
					detail[i]["pilihanB"] = pilihanB
					detail[i]["pilihanC"] = pilihanC
					detail[i]["pilihanD"] = pilihanD
					detail[i]["jawabanBenar"] = jawabanBenar
					// penjelasan mungkin sudah ada dari submit, tapi lebih baik pakai dari database
					if penjelasan != "" {
						detail[i]["penjelasan"] = penjelasan
					}
				}
			}
		}
	}
	c.JSON(http.StatusOK, gin.H{
		"id":             id,
		"judul":          judul,
		"mataPelajaran":  mapel,
		"nilai":          nilai,
		"detail":         detail,
	})
}

// ==================== RATA-RATA NILAI SISWA ====================
func getRataRataHandler(c *gin.Context) {
	siswaId := c.Param("siswaId")
	var avg sql.NullFloat64
	err := db.QueryRow("SELECT AVG(nilai) FROM hasil_ujian WHERE siswa_id = ?", siswaId).Scan(&avg)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"rataRata": 0})
		return
	}
	nilai := 0.0
	if avg.Valid {
		nilai = avg.Float64
	}
	c.JSON(http.StatusOK, gin.H{"rataRata": nilai})
}

// ==================== HAPUS RIWAYAT ====================
func deleteRiwayatHandler(c *gin.Context) {
	id := c.Param("id")
	_, err := db.Exec("DELETE FROM hasil_ujian WHERE id = ?", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal menghapus riwayat"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Riwayat berhasil dihapus"})
}

// ==================== GURU (SEMUA NILAI SISWA) ====================
func getAllNilaiSiswaHandler(c *gin.Context) {
	rows, err := db.Query(`
		SELECT u.name, u.email, mp.nama, h.nilai, h.tanggal, h.ujian_id
		FROM hasil_ujian h
		JOIN users u ON h.siswa_id = u.id
		JOIN ujian uj ON h.ujian_id = uj.id
		JOIN mata_pelajaran mp ON uj.mata_pelajaran_id = mp.id
		ORDER BY h.tanggal DESC
	`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Database error"})
		return
	}
	defer rows.Close()
	var list []gin.H
	for rows.Next() {
		var name, email, mapel string
		var nilai int
		var tanggal string
		var ujianID int
		rows.Scan(&name, &email, &mapel, &nilai, &tanggal, &ujianID)
		list = append(list, gin.H{
			"siswa":         name,
			"email":         email,
			"mataPelajaran": mapel,
			"nilai":         nilai,
			"tanggal":       tanggal,
			"ujianId":       ujianID,
		})
	}
	c.JSON(http.StatusOK, gin.H{"data": list})
}

// ==================== GURU (SEMUA SISWA) ====================
func getAllSiswaHandler(c *gin.Context) {
	rows, err := db.Query(`
		SELECT id, name, email, created_at FROM users WHERE role = 'siswa' ORDER BY name
	`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Database error"})
		return
	}
	defer rows.Close()
	var siswa []gin.H
	for rows.Next() {
		var id int
		var name, email, createdAt string
		rows.Scan(&id, &name, &email, &createdAt)
		var lastActivity sql.NullString
		db.QueryRow("SELECT last_activity FROM user_sessions WHERE user_id = ? AND last_activity > DATE_SUB(NOW(), INTERVAL 5 MINUTE)", id).Scan(&lastActivity)
		status := "offline"
		if lastActivity.Valid {
			status = "online"
		}
		siswa = append(siswa, gin.H{
			"id": id, "name": name, "email": email,
			"status": status, "createdAt": createdAt,
		})
	}
	c.JSON(http.StatusOK, gin.H{"data": siswa})
}

// ==================== GURU (DETAIL SISWA) ====================
func getDetailSiswaHandler(c *gin.Context) {
	siswaId := c.Param("siswaId")
	var siswa struct {
		ID    int
		Name  string
		Email string
	}
	err := db.QueryRow("SELECT id, name, email FROM users WHERE id = ? AND role = 'siswa'", siswaId).Scan(&siswa.ID, &siswa.Name, &siswa.Email)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Siswa tidak ditemukan"})
		return
	}
	rows, err := db.Query(`
		SELECT h.id, u.judul, mp.nama, h.nilai, h.tanggal
		FROM hasil_ujian h
		JOIN ujian u ON h.ujian_id = u.id
		JOIN mata_pelajaran mp ON u.mata_pelajaran_id = mp.id
		WHERE h.siswa_id = ?
		ORDER BY h.tanggal DESC
	`, siswaId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Database error"})
		return
	}
	defer rows.Close()
	var riwayat []gin.H
	for rows.Next() {
		var id int
		var judul, mapel string
		var nilai int
		var tanggal string
		rows.Scan(&id, &judul, &mapel, &nilai, &tanggal)
		riwayat = append(riwayat, gin.H{
			"id": id, "judul": judul, "mataPelajaran": mapel,
			"nilai": nilai, "tanggal": tanggal,
		})
	}
	c.JSON(http.StatusOK, gin.H{
		"siswa":   gin.H{"id": siswa.ID, "name": siswa.Name, "email": siswa.Email},
		"riwayat": riwayat,
	})
}