# OpenMusic API v3

Ini adalah versi lanjutan dari proyek **[OpenMusic API v2](https://github.com/irfandwisamudra/openmusic-api-v2)**, yang kini dilengkapi dengan fitur **ekspor playlist via RabbitMQ**, **unggah sampul album**, serta **suka/batal suka album dengan cache Redis**. Selain itu, proyek ini juga menambahkan **optimisasi caching detail album** untuk meningkatkan performa.

Proyek ini merupakan _submission_ untuk kelas **Belajar Fundamental Back-End dengan JavaScript** (Dicoding).

API ini berfungsi sebagai _back-end_ pemutar musik: mengelola data album, lagu, pengguna, playlist, kolaborasi, hingga ekspor dan unggah sampul.

---

## Fitur

- [x] **Ekspor Lagu pada Playlist (V3)**  
       Producer mengirim `{ playlistId, targetEmail }` ke RabbitMQ, Consumer membuat JSON dan mengirim lewat email (SMTP).
- [x] **Unggah Sampul Album (V3)**  
       Upload `cover` (image, max **512 KB**) ke **storage lokal**. `GET /albums/{id}` menampilkan `coverUrl`.
- [x] **Suka/Batal Suka Album + Cache (V3)**  
       `POST/DELETE /albums/{id}/likes`, `GET /albums/{id}/likes` menggunakan **Redis** dengan TTL **30 menit** + header `X-Data-Source`.
- [x] **Caching Detail Album (Tambahan)**  
       `GET /albums/{id}` menyimpan data album + daftar lagu di Redis (TTL **30 menit**). Cache otomatis terhapus saat album diubah, dihapus, atau sampul diperbarui.
- [x] **Mempertahankan Fitur v1/v2**  
       CRUD Album & Lagu, Registrasi & Autentikasi (JWT), Playlist, (Opsional) Kolaborasi & Aktivitas, Validasi, Foreign Key, Error Handling.

---

## Teknologi

- **Node.js (Hapi)**, **PostgreSQL**, **RabbitMQ**, **Redis**
- **JWT** untuk autentikasi, **Nodemailer (SMTP)** untuk email ekspor
- **Storage Lokal** untuk sampul album

---

## Struktur Proyek

```
openmusic-api-v3/
├─ openmusic-api-v3/          # API server (Hapi)
│  ├─ migrations/             # Database migrations
│  ├─ src/
│  │  ├─ api/                 # Handlers + routes
│  │  ├─ exceptions/          # Error handling
│  │  ├─ services/
│  │  │  ├─ postgres/         # DB services
│  │  │  ├─ rabbitmq/         # ProducerService
│  │  │  ├─ redis/            # CacheService
│  │  │  └─ storage/          # StorageService
│  │  ├─ tokenize/            # Tokenization
│  │  ├─ utils/               # helpers
│  │  ├─ validator/           # Joi schemas & validators
│  │  └─ server.js            # Hapi bootstrap
│  ├─ .env.example
│  ├─ package.json
│  └─ ...
└─ openmusic-consumer/        # Consumer app (RabbitMQ listener + mailer)
   ├─ src/
   │  ├─ consumer.js
   │  ├─ listener.js
   │  ├─ MailSender.js        # Handles sending emails
   │  └─ PlaylistsService.js  # Reads playlist + songs for export email
   ├─ .env.example
   ├─ package.json
   └─ ...
```

---

## Prasyarat

- Node.js v22 LTS
- PostgreSQL (running & reachable)
- Redis (for caching)
- RabbitMQ (message broker)
- SMTP credentials (for export email)
- (Optional) AWS S3 credentials if using S3 for covers

---

## Environment Variables

> Salin masing-masing ke **`.env`** pada proyek **API** dan **Consumer**.

### API — `openmusic-api-v3/openmusic-api-v3/.env.example`

```ini
# Server Configuration
HOST=localhost
PORT=5000

# PostgreSQL Configuration
PGUSER=postgres
PGHOST=localhost
PGPASSWORD=your_postgres_password
PGDATABASE=openmusic_v3
PGPORT=5432

# JWT Token Configuration
ACCESS_TOKEN_KEY=your_access_token_key
REFRESH_TOKEN_KEY=your_refresh_token_key
ACCESS_TOKEN_AGE=1800

# RabbitMQ Configuration
RABBITMQ_SERVER=amqp://localhost

# Redis
REDIS_SERVER=localhost
```

### Consumer — `openmusic-api-v3/openmusic-consumer/.env.example`

```ini
# PostgreSQL Configuration
PGUSER=postgres
PGHOST=localhost
PGPASSWORD=your_postgres_password
PGDATABASE=openmusic_v3
PGPORT=5432

# SMTP Configuration
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_smtp_username
SMTP_PASSWORD=your_smtp_password

# RabbitMQ Configuration
RABBITMQ_SERVER=amqp://localhost
```

---

## Menjalankan

```bash
# 1) Install dependensi
cd openmusic-api-v3/openmusic-api-v3 && npm install
cd ../../openmusic-consumer && npm install

# 2) Pastikan PostgreSQL, Redis, RabbitMQ aktif

# 3) Jalankan API (terminal 1)
cd openmusic-api-v3/openmusic-api-v3
npm run start   # http://localhost:5000

# 4) Jalankan Consumer (terminal 2)
cd openmusic-consumer
npm run start
```

---

## Endpoint

### Autentikasi & Pengguna

| Method | Path               | Auth | Body / Query                       | Keterangan                   |
| :----: | ------------------ | :--: | ---------------------------------- | ---------------------------- |
|  POST  | `/users`           |  –   | `{ username, password, fullname }` | Registrasi                   |
|  POST  | `/authentications` |  –   | `{ username, password }`           | Login (access & refresh)     |
|  PUT   | `/authentications` |  –   | `{ refreshToken }`                 | Refresh access token         |
| DELETE | `/authentications` |  –   | `{ refreshToken }`                 | Logout (hapus refresh token) |

### Albums

| Method | Path                  | Auth | Body / Query                            | Keterangan                                        |
| :----: | --------------------- | :--: | --------------------------------------- | ------------------------------------------------- |
|  POST  | `/albums`             |  ✓   | `{ name, year }`                        | Tambah album                                      |
|  GET   | `/albums/{id}`        |  –   | –                                       | Detail album + lagu (`coverUrl`) **dengan cache** |
|  PUT   | `/albums/{id}`        |  ✓   | `{ name, year }`                        | Ubah album (hapus cache)                          |
| DELETE | `/albums/{id}`        |  ✓   | –                                       | Hapus album (hapus cache)                         |
|  POST  | `/albums/{id}/covers` |  ✓   | **Form-Data**: `cover` (image, ≤ 512KB) | Unggah sampul album (hapus cache)                 |

### Songs

| Method | Path          | Auth | Body / Query                             | Keterangan                  |
| :----: | ------------- | :--: | ---------------------------------------- | --------------------------- |
|  POST  | `/songs`      |  ✓   | `{ title, year, genre, performer, ... }` | Tambah lagu                 |
|  GET   | `/songs`      |  –   | `title?`, `performer?`                   | List lagu (filter optional) |
|  GET   | `/songs/{id}` |  –   | –                                        | Detail lagu                 |
|  PUT   | `/songs/{id}` |  ✓   | (field lagu)                             | Ubah lagu                   |
| DELETE | `/songs/{id}` |  ✓   | –                                        | Hapus lagu                  |

### Playlists

| Method | Path                    | Auth | Body / Query | Keterangan                     |
| :----: | ----------------------- | :--: | ------------ | ------------------------------ |
|  POST  | `/playlists`            |  ✓   | `{ name }`   | Buat playlist                  |
|  GET   | `/playlists`            |  ✓   | –            | Daftar playlist milik pengguna |
| DELETE | `/playlists/{id}`       |  ✓   | –            | Hapus playlist (pemilik saja)  |
|  POST  | `/playlists/{id}/songs` |  ✓   | `{ songId }` | Tambah lagu ke playlist        |
|  GET   | `/playlists/{id}/songs` |  ✓   | –            | Lihat lagu dalam playlist      |
| DELETE | `/playlists/{id}/songs` |  ✓   | `{ songId }` | Hapus lagu dari playlist       |

### (Opsional) Kolaborasi & Aktivitas

| Method | Path                         | Auth | Body / Query             | Keterangan                        |
| :----: | ---------------------------- | :--: | ------------------------ | --------------------------------- |
|  POST  | `/collaborations`            |  ✓   | `{ playlistId, userId }` | Tambah kolaborator (pemilik saja) |
| DELETE | `/collaborations`            |  ✓   | `{ playlistId, userId }` | Hapus kolaborator                 |
|  GET   | `/playlists/{id}/activities` |  ✓   | –                        | Riwayat aktivitas playlist        |

### **V3: Ekspor Playlist**

| Method | Path                             | Auth | Body                                   | Response (201)                                                          |
| :----: | -------------------------------- | :--: | -------------------------------------- | ----------------------------------------------------------------------- |
|  POST  | `/export/playlists/{playlistId}` |  ✓   | `{ "targetEmail": "you@example.com" }` | `{ "status":"success","message":"Permintaan Anda sedang kami proses" }` |

> Hanya **pemilik** playlist yang boleh mengekspor. Producer mengirim ke **RabbitMQ**; Consumer mengirim JSON lewat **email (SMTP)**.

### **V3: Album Likes + Cache**

| Method | Path                 | Auth | Keterangan                                                          |
| :----: | -------------------- | :--: | ------------------------------------------------------------------- |
|  POST  | `/albums/{id}/likes` |  ✓   | Suka album (1x saja per user; percobaan kedua → **400**)            |
| DELETE | `/albums/{id}/likes` |  ✓   | Batal suka                                                          |
|  GET   | `/albums/{id}/likes` |  –   | Kembalikan jumlah suka; header: `X-Data-Source: database` / `cache` |

---

Dibuat oleh **Irfan Dwi Samudra** · GitHub: [https://github.com/irfandwisamudra](https://github.com/irfandwisamudra)
