/** Halaman masuk: label formulir, pesan status, dan dialog ketentuan. */

const messages = {
  "Unable to connect to the backend service": "Tidak dapat terhubung ke layanan backend",
  "Please read and agree to the Terms of Use first": "Harap baca dan setujui Ketentuan Penggunaan terlebih dahulu",
  "Incorrect username or password": "Nama pengguna atau kata sandi salah",
  "Checking sign-in status…": "Memeriksa status masuk…",
  Login: "Masuk",
  "Welcome back. Enter your password to continue using CYFIND":
    "Selamat datang kembali. Masukkan kata sandi untuk melanjutkan penggunaan CYFIND",
  Username: "Nama pengguna",
  Password: "Kata sandi",
  "Enter your password": "Masukkan kata sandi",
  "I have read and agree to the ": "Saya telah membaca dan menyetujui ",
  "Terms of Use": "Ketentuan Penggunaan",
  "Signing in…": "Sedang masuk…",
  "CYFIND Terms of Use and Disclaimer": "CYFIND Ketentuan Penggunaan dan Penafian",
  "Version v1.0 · Effective 2026-09-18 · Please read all of the following terms in full before signing in":
    "Versi v1.0 · Berlaku sejak 2026-09-18 · Harap baca seluruh ketentuan berikut secara lengkap sebelum masuk",
  'This Terms of Use and Disclaimer (hereinafter referred to as "this Statement") is the agreement between you and the authors and contributors of the CYFIND project concerning your use of the Software. Please read carefully and fully understand each term before use, in particular the disclaimers, limitations of liability, and prohibitions marked in bold or in a color block.':
    'Ketentuan Penggunaan dan Penafian ini (selanjutnya disebut "Pernyataan ini") merupakan perjanjian antara Anda dengan para penulis dan kontributor proyek CYFIND mengenai penggunaan Perangkat Lunak ini. Harap membaca setiap ketentuan dengan saksama dan memahaminya secara sepenuhnya sebelum menggunakannya, khususnya klausul penafian, batasan tanggung jawab, dan larangan yang ditandai dengan huruf tebal atau blok warna.',
  "Once you download, install, access, or use the Software in any way, you will be deemed to have read, understood, and agreed to be bound by this Statement in its entirety.":
    "Begitu Anda mengunduh, memasang, mengakses, atau menggunakan Perangkat Lunak ini dengan cara apa pun, Anda dianggap telah membaca, memahami, dan menyetujui untuk terikat sepenuhnya oleh Pernyataan ini.",
  "Article 1 · Definitions and Open Source License": "Pasal 1 · Definisi dan Lisensi Sumber Terbuka",
  "The Software (Cyfind AI) is open-source software released under the MIT License. You may freely use, copy, modify, merge, publish, distribute, sublicense, and sell copies of the Software, provided the copyright notice and permission notice are included. The complete terms are set out in the accompanying LICENSE file.":
    "Perangkat Lunak (Cyfind AI) adalah perangkat lunak sumber terbuka yang dirilis di bawah Lisensi MIT. Anda bebas menggunakan, menyalin, memodifikasi, menggabungkan, menerbitkan, mendistribusikan, mensublisensikan, dan menjual salinan Perangkat Lunak ini, dengan syarat pemberitahuan hak cipta dan izin disertakan. Ketentuan lengkap diatur dalam berkas LICENSE yang disertakan.",
  "Article 2 · Scope of Permitted Use": "Pasal 2 · Cakupan Penggunaan yang Diizinkan",
  "The Software is provided solely for personal learning, code research, discussion of security technology principles, and technical verification in a local isolated environment set up by you yourself; it applies to non-aggressive and non-destructive purposes such as learning, academic research, and code review. Except for the circumstances expressly permitted in this Article, you may not use the Software for any other purpose.":
    "Perangkat Lunak ini disediakan semata-mata untuk pembelajaran pribadi, penelitian kode, pembahasan prinsip teknologi keamanan, serta verifikasi teknis di lingkungan terisolasi lokal yang Anda bangun sendiri; berlaku untuk tujuan non-agresif dan non-destruktif seperti pembelajaran, penelitian akademik, dan tinjauan kode. Selain keadaan yang diizinkan secara tegas dalam Pasal ini, Anda tidak boleh menggunakan Perangkat Lunak ini untuk tujuan apa pun lainnya.",
  "Article 3 · Prohibited Conduct": "Pasal 3 · Perilaku yang Dilarang",
  "You must not scan, probe, exploit, or attack any website, online service, or networked system owned by others or by a third party (regardless of whether you have obtained authorization, and regardless of whether it is your own asset);":
    "Anda dilarang memindai, memeriksa, mengeksploitasi, atau menyerang situs web, layanan daring, atau sistem jaringan mana pun yang dimiliki pihak lain atau pihak ketiga (terlepas dari apakah Anda telah memperoleh izin, dan terlepas dari apakah itu aset Anda sendiri);",
  "You must not use the Software for any real-world penetration testing, offensive and defensive exercises, red team or blue team drills, or production environments;":
    "Anda dilarang menggunakan Perangkat Lunak ini untuk pengujian penetrasi nyata, latihan serangan dan pertahanan, latihan tim merah atau tim biru, atau lingkungan produksi;",
  "You must not use the Software for unlawful intrusion, data theft, extortion, denial of service (DoS/DDoS), or any destructive or criminal activity;":
    "Anda dilarang menggunakan Perangkat Lunak ini untuk penyusupan tidak sah, pencurian data, pemerasan, penolakan layanan (DoS/DDoS), atau kegiatan destruktif atau kriminal apa pun;",
  "You must not remove, tamper with, or circumvent any copyright, license, or security notice information in the Software or its output;":
    "Anda dilarang menghapus, memanipulasi, atau menghindari informasi hak cipta, lisensi, atau pemberitahuan keamanan apa pun dalam Perangkat Lunak ini maupun keluarannya;",
  "You must not engage in any conduct that violates the laws, regulations, or regulatory requirements of your country or region.":
    "Anda dilarang melakukan segala perbuatan yang melanggar hukum, peraturan, atau ketentuan regulasi di negara atau wilayah Anda.",
  "Article 4 · Intellectual Property": "Pasal 4 · Kekayaan Intelektual",
  'The copyright and related intellectual property rights in the Software belong to the authors and contributors of the project. The Software is provided "as is", without warranty of any kind; the rights granted to you are those set out in the MIT License in the accompanying LICENSE file.':
    'Hak cipta dan hak kekayaan intelektual terkait atas Perangkat Lunak ini dimiliki oleh para penulis dan kontributor proyek. Perangkat Lunak disediakan "sebagaimana adanya", tanpa jaminan apa pun; hak yang diberikan kepada Anda adalah sebagaimana diatur dalam Lisensi MIT pada berkas LICENSE yang disertakan.',
  "Article 5 · Data and Privacy": "Pasal 5 · Data dan Privasi",
  "The Software is an open source program that you can self-host; its authors do not operate any centralized service and will not collect or upload your usage data. All data that you generate, process, or come into contact with during use remains under your own control, and you are responsible for its legality and security; you bear any consequences arising from improper handling of data.":
    "Perangkat Lunak ini adalah program sumber terbuka yang dapat Anda hosting sendiri; para penulisnya tidak mengoperasikan layanan terpusat mana pun dan tidak akan mengumpulkan atau mengunggah data penggunaan Anda. Seluruh data yang Anda hasilkan, proses, atau temui selama penggunaan berada di bawah kendali Anda sepenuhnya, dan Anda bertanggung jawab atas keabsahan serta keamannya; Anda menanggung segala akibat yang timbul akibat penanganan data yang tidak semestinya.",
  "Article 6 · Compliance and Legal Liability": "Pasal 6 · Kepatuhan dan Tanggung Jawab Hukum",
  "You must yourself comply with all laws and regulations of your country or region concerning cybersecurity, data security and personal information protection, computer crimes, and the like (in mainland China, including but not limited to the Cybersecurity Law, the Data Security Law, the Personal Information Protection Law, and the relevant judicial interpretations).":
    "Anda wajib mematuhi secara mandiri seluruh hukum dan peraturan di negara atau wilayah Anda mengenai keamanan siber, keamanan data dan perlindungan data pribadi, kejahatan komputer, dan sebagainya (di Tiongkok daratan termasuk namun tidak terbatas pada Cybersecurity Law, Data Security Law, Personal Information Protection Law, serta tafsir yudisial yang relevan).",
  "All legal liabilities and consequences arising from your violation of the aforementioned laws and regulations or of this Statement are borne solely by you, and have no relation to the authors and contributors of the Software.":
    "Segala tanggung jawab dan akibat hukum yang timbul dari pelanggaran Anda terhadap hukum dan peraturan tersebut di atas maupun ketentuan Pernyataan ini menjadi tanggung jawab Anda sepenuhnya, dan tidak berkaitan dengan para penulis dan kontributor Perangkat Lunak ini.",
  "Article 7 · Disclaimer and Limitation of Liability": "Pasal 7 · Penafian dan Batasan Tanggung Jawab",
  'The Software is provided on an "AS IS" and "AS AVAILABLE" basis, without any express or implied warranties, including but not limited to warranties of merchantability, fitness for a particular purpose, accuracy, and non-infringement. To the maximum extent permitted by applicable law, the authors and contributors of the Software shall not be liable for any direct, indirect, incidental, special, or consequential loss arising from the use of, or inability to use, the Software (whether or not the use is proper), including but not limited to loss of data, system damage, business interruption, loss of profits, or legal disputes.':
    'Perangkat Lunak ini disediakan dalam keadaan "sebagaimana adanya" (AS IS) dan "sebagaimana tersedia" (AS AVAILABLE), tanpa jaminan apa pun, baik tersurat maupun tersirat, termasuk namun tidak terbatas pada jaminan dapat diperjualbelikan, kesesuaian untuk tujuan tertentu, keakuratan, dan tidak melanggar hak pihak lain. Sejauh diizinkan oleh hukum yang berlaku, para penulis dan kontributor Perangkat Lunak ini tidak bertanggung jawab atas kerugian langsung, tidak langsung, insidental, khusus, atau konsekuensial apa pun yang timbul dari penggunaan atau ketidakmampuan menggunakan Perangkat Lunak ini (terlepas dari apakah penggunaannya tepat atau tidak), termasuk namun tidak terbatas pada kehilangan data, kerusakan sistem, gangguan bisnis, hilangnya keuntungan, atau sengketa hukum.',
  "Article 8 · Amendments and Final Interpretation": "Pasal 8 · Perubahan Ketentuan dan Tafsir Akhir",
  "The authors reserve the right to update this Statement from time to time as required by laws and regulations or the development of the project; updated versions will be released together with the project and take effect from the date of publication, and your continued use of the Software constitutes acceptance of the revised terms. To the extent permitted by law, the authors of the project hold the final right of interpretation of this Statement. If any term of this Statement is held to be invalid, the validity of the remaining terms shall not be affected.":
    "Penulis berhak memperbarui Pernyataan ini dari waktu ke waktu sesuai kebutuhan hukum dan peraturan atau perkembangan proyek; versi yang diperbarui akan dirilis bersama proyek dan berlaku sejak tanggal pengumuman, dan kelanjutan penggunaan Anda atas Perangkat Lunak ini dianggap sebagai penerimaan atas ketentuan yang telah diubah. Sejauh diizinkan oleh hukum, hak tafsir akhir atas Pernyataan ini terletak pada para penulis proyek. Jika ada ketentuan dalam Pernyataan ini dinyatakan tidak sah, keabsahan ketentuan lainnya tidak terpengaruh.",
  "You have reviewed all terms": "Anda telah menelusuri seluruh ketentuan",
  "Please scroll to the bottom of the terms before confirming":
    "Harap gulir ke bagian bawah ketentuan sebelum mengonfirmasi",
  "I have read and agree to all terms": "Saya telah membaca dan menyetujui seluruh ketentuan",
} satisfies Record<string, string>;

export default messages;
