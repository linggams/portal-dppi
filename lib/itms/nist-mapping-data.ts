export type NistOffering = { name: string }

export type NistCategory = {
  code: string
  name: string
  subcategories: string[]
  offerings: NistOffering[]
}

export type NistFunction = {
  title: string
  description: string
  categories: NistCategory[]
}

export type NistMappingData = Record<string, NistFunction>

export const NIST_MAPPING_DATA: NistMappingData = {
  "govern": {
    "title": "GV: Govern (Tata Kelola)",
    "description": "Fungsi tata kelola yang mengembangkan dan mengimplementasikan strategi, kebijakan, dan prosedur untuk mengelola risiko keamanan siber.",
    "categories": [
      {
        "code": "GV.OC",
        "name": "Konteks Organisasi",
        "subcategories": [
          "GV.OC-01: Misi organisasi dipahami dan menginformasikan manajemen risiko keamanan siber",
          "GV.OC-02: Pemangku kepentingan internal dan eksternal dipahami, dan kebutuhan serta harapan mereka terkait manajemen risiko keamanan siber dipahami dan dipertimbangkan",
          "GV.OC-03: Persyaratan hukum, peraturan, dan kontraktual terkait keamanan siber — termasuk kewajiban privasi dan kebebasan sipil — dipahami dan dikelola",
          "GV.OC-04: Tujuan, kemampuan, dan layanan kritis yang bergantung pada atau diharapkan dari organisasi oleh pemangku kepentingan eksternal dipahami dan dikomunikasikan",
          "GV.OC-05: Hasil, kemampuan, dan layanan yang bergantung pada organisasi dipahami dan dikomunikasikan"
        ],
        "offerings": [
          {
            "name": "Permintaan Buka Blokir Website"
          },
          {
            "name": "Pembuatan Akun Web dan Email"
          },
          {
            "name": "Penggantian Password"
          },
          {
            "name": "Pengelolaan Website"
          }
        ]
      },
      {
        "code": "GV.RM",
        "name": "Strategi Manajemen Risiko",
        "subcategories": [
          "GV.RM-01: Tujuan manajemen risiko ditetapkan dan disepakati oleh pemangku kepentingan organisasi",
          "GV.RM-02: Pernyataan selera risiko dan toleransi risiko ditetapkan, dikomunikasikan, dan dipelihara",
          "GV.RM-03: Aktivitas dan hasil manajemen risiko keamanan siber dimasukkan dalam proses manajemen risiko perusahaan",
          "GV.RM-04: Arah strategis yang menggambarkan opsi respons risiko yang tepat ditetapkan dan dikomunikasikan",
          "GV.RM-05: Jalur komunikasi di seluruh organisasi ditetapkan untuk risiko keamanan siber, termasuk risiko dari pemasok dan pihak ketiga lainnya",
          "GV.RM-06: Metode standar untuk menghitung, mendokumentasikan, mengkategorikan, dan memprioritaskan risiko keamanan siber ditetapkan dan dikomunikasikan",
          "GV.RM-07: Peluang strategis (yaitu, risiko positif) dikarakterisasi dan dimasukkan dalam diskusi risiko keamanan siber organisasi"
        ],
        "offerings": [
          {
            "name": "Penanganan Gangguan Jaringan"
          },
          {
            "name": "Penanganan Gangguan Server"
          },
          {
            "name": "Back Up & Restore Data"
          }
        ]
      },
      {
        "code": "GV.RR",
        "name": "Peran, Tanggung Jawab, dan Wewenang",
        "subcategories": [
          "GV.RR-01: Kepemimpinan organisasi bertanggung jawab dan akuntabel untuk risiko keamanan siber dan menumbuhkan budaya yang sadar risiko, etis, dan terus meningkat",
          "GV.RR-02: Peran, tanggung jawab, dan wewenang terkait manajemen risiko keamanan siber ditetapkan, dikomunikasikan, dipahami, dan ditegakkan",
          "GV.RR-03: Sumber daya yang memadai dialokasikan sesuai dengan strategi risiko keamanan siber, peran, tanggung jawab, dan kebijakan",
          "GV.RR-04: Keamanan siber dimasukkan dalam praktik sumber daya manusia"
        ],
        "offerings": [
          {
            "name": "User Support"
          }
        ]
      },
      {
        "code": "GV.PO",
        "name": "Kebijakan",
        "subcategories": [
          "GV.PO-01: Kebijakan untuk mengelola risiko keamanan siber ditetapkan berdasarkan konteks organisasi, strategi keamanan siber, dan prioritas serta dikomunikasikan dan ditegakkan",
          "GV.PO-02: Kebijakan untuk mengelola risiko keamanan siber ditinjau, diperbarui, dikomunikasikan, dan ditegakkan untuk mencerminkan perubahan dalam persyaratan, ancaman, teknologi, dan misi organisasi"
        ],
        "offerings": [
          {
            "name": "Pengelolaan Camera Security"
          }
        ]
      },
      {
        "code": "GV.OV",
        "name": "Pengawasan",
        "subcategories": [
          "GV.OV-01: Hasil strategi manajemen risiko keamanan siber ditinjau untuk menginformasikan dan menyesuaikan strategi dan arah",
          "GV.OV-02: Strategi manajemen risiko keamanan siber ditinjau dan disesuaikan untuk memastikan cakupan persyaratan dan risiko organisasi",
          "GV.OV-03: Kinerja manajemen risiko keamanan siber organisasi dievaluasi dan ditinjau untuk penyesuaian yang diperlukan"
        ],
        "offerings": [
          {
            "name": "ERP"
          },
          {
            "name": "Internal Application"
          }
        ]
      },
      {
        "code": "GV.SC",
        "name": "Manajemen Risiko Rantai Pasok Keamanan Siber",
        "subcategories": [
          "GV.SC-01: Program, strategi, tujuan, kebijakan, dan proses manajemen risiko rantai pasok keamanan siber ditetapkan dan disepakati oleh pemangku kepentingan organisasi",
          "GV.SC-02: Peran dan tanggung jawab keamanan siber untuk pemasok, pelanggan, dan mitra ditetapkan, dikomunikasikan, dan dikoordinasikan secara internal dan eksternal",
          "GV.SC-03: Manajemen risiko rantai pasok keamanan siber diintegrasikan ke dalam manajemen risiko keamanan siber dan perusahaan, penilaian risiko, dan proses peningkatan",
          "GV.SC-04: Pemasok dikenal dan diprioritaskan berdasarkan kritikalitas",
          "GV.SC-05: Persyaratan untuk mengatasi risiko keamanan siber dalam rantai pasok ditetapkan, diprioritaskan, dan diintegrasikan ke dalam kontrak dan jenis perjanjian lainnya dengan pemasok dan pihak ketiga relevan lainnya",
          "GV.SC-06: Perencanaan dan uji tuntas dilakukan untuk mengurangi risiko sebelum memasuki hubungan formal dengan pemasok atau pihak ketiga lainnya",
          "GV.SC-07: Risiko yang ditimbulkan oleh pemasok, produk dan layanan mereka, dan pihak ketiga lainnya dipahami, dicatat, diprioritaskan, dinilai, ditanggapi, dan dipantau selama hubungan",
          "GV.SC-08: Pemasok dan pihak ketiga relevan lainnya dimasukkan dalam aktivitas perencanaan, respons, dan pemulihan insiden",
          "GV.SC-09: Praktik keamanan rantai pasok diintegrasikan ke dalam program manajemen risiko keamanan siber dan perusahaan, dan kinerjanya dipantau sepanjang siklus hidup produk dan layanan teknologi",
          "GV.SC-10: Rencana manajemen risiko rantai pasok keamanan siber mencakup ketentuan untuk aktivitas yang terjadi setelah berakhirnya kemitraan atau perjanjian layanan"
        ],
        "offerings": [
          {
            "name": "Pengembangan Aplikasi Khusus"
          },
          {
            "name": "Pengembangan Sistem Informasi"
          }
        ]
      }
    ]
  },
  "identify": {
    "title": "ID: Identify (Identifikasi)",
    "description": "Fungsi untuk mengembangkan pemahaman organisasi dalam mengelola risiko keamanan siber terhadap sistem, aset, data, dan kemampuan.",
    "categories": [
      {
        "code": "ID.AM",
        "name": "Manajemen Aset",
        "subcategories": [
          "ID.AM-01: Inventaris perangkat keras dipelihara",
          "ID.AM-02: Inventaris perangkat lunak, layanan, dan sistem dipelihara",
          "ID.AM-03: Alur komunikasi jaringan dipetakan",
          "ID.AM-04: Sistem informasi eksternal dikatalogkan",
          "ID.AM-05: Sumber daya (misalnya, perangkat keras, perangkat, data, waktu, personel, dan perangkat lunak) diprioritaskan berdasarkan klasifikasi, kritikalitas, dan nilai bisnis",
          "ID.AM-06: Peran dan tanggung jawab keamanan siber untuk seluruh tenaga kerja dan pemangku kepentingan pihak ketiga (misalnya, pemasok, pelanggan, mitra) ditetapkan",
          "ID.AM-07: Inventaris data dan metadata dipelihara",
          "ID.AM-08: Proses manajemen siklus hidup aset ditetapkan dan dipelihara"
        ],
        "offerings": [
          {
            "name": "Server & Database"
          }
        ]
      },
      {
        "code": "ID.RA",
        "name": "Penilaian Risiko",
        "subcategories": [
          "ID.RA-01: Proses penilaian risiko ditetapkan, dikelola, dan disepakati oleh pemangku kepentingan organisasi",
          "ID.RA-02: Intelijen ancaman siber diterima dan dianalisis",
          "ID.RA-03: Ancaman, baik internal maupun eksternal, diidentifikasi dan didokumentasikan",
          "ID.RA-04: Dampak bisnis potensial dan kemungkinan diidentifikasi",
          "ID.RA-05: Ancaman, kerentanan, kemungkinan, dan dampak digunakan untuk menentukan risiko",
          "ID.RA-06: Respons risiko diidentifikasi dan diprioritaskan",
          "ID.RA-07: Hasil penilaian risiko ditinjau dan dikomunikasikan kepada pemangku kepentingan",
          "ID.RA-08: Hasil penilaian risiko digunakan untuk menginformasikan keputusan manajemen risiko",
          "ID.RA-09: Hasil penilaian risiko digunakan untuk menginformasikan keputusan arsitektur keamanan",
          "ID.RA-10: Hasil penilaian risiko digunakan untuk menginformasikan keputusan manajemen risiko rantai pasok"
        ],
        "offerings": [
          {
            "name": "Pemasangan dan Pemeliharaan Jaringan"
          },
          {
            "name": "Vulnerability Management"
          },
          {
            "name": "Penanganan Gangguan Jaringan"
          }
        ]
      },
      {
        "code": "ID.IM",
        "name": "Peningkatan",
        "subcategories": [
          "ID.IM-01: Peningkatan dari evaluasi dimasukkan ke dalam strategi manajemen risiko",
          "ID.IM-02: Peningkatan dari tes keamanan dimasukkan ke dalam strategi manajemen risiko",
          "ID.IM-03: Peningkatan dari proses operasional dimasukkan ke dalam strategi manajemen risiko",
          "ID.IM-04: Peningkatan dari aktivitas respons insiden dimasukkan ke dalam strategi manajemen risiko"
        ],
        "offerings": []
      }
    ]
  },
  "protect": {
    "title": "PR: Protect (Perlindungan)",
    "description": "Fungsi untuk mengembangkan dan mengimplementasikan tindakan yang tepat untuk memastikan pengiriman layanan infrastruktur kritis.",
    "categories": [
      {
        "code": "PR.AA",
        "name": "Manajemen Identitas, Autentikasi, dan Kontrol Akses",
        "subcategories": [
          "PR.AA-01: Identitas dan kredensial diterbitkan, dikelola, diverifikasi, dicabut, dan diaudit untuk perangkat, pengguna, dan proses yang berwenang",
          "PR.AA-02: Akses fisik ke aset dikelola dan dilindungi",
          "PR.AA-03: Akses jarak jauh dikelola",
          "PR.AA-04: Izin akses dikelola, menggabungkan prinsip hak istimewa minimal",
          "PR.AA-05: Integritas jaringan dilindungi (misalnya, segregasi jaringan, segmentasi jaringan)",
          "PR.AA-06: Identitas dibuktikan dan terikat pada kredensial serta ditegaskan dalam interaksi",
          "PR.AA-07: Pengguna, perangkat, dan aset lainnya diautentikasi (misalnya, single-factor, multi-factor) sesuai dengan risiko transaksi (misalnya, risiko keamanan dan privasi individu serta risiko organisasi lainnya)"
        ],
        "offerings": [
          {
            "name": "Remote Access"
          },
          {
            "name": "Permintaan Buka Blokir Website"
          }
        ]
      },
      {
        "code": "PR.AT",
        "name": "Kesadaran dan Pelatihan",
        "subcategories": [
          "PR.AT-01: Semua pengguna diinformasikan dan dilatih",
          "PR.AT-02: Pengguna berhak istimewa memahami peran dan tanggung jawab",
          "PR.AT-03: Pemangku kepentingan pihak ketiga (misalnya, pemasok, pelanggan, mitra) memahami peran dan tanggung jawab",
          "PR.AT-04: Eksekutif senior memahami peran dan tanggung jawab",
          "PR.AT-05: Personel fisik dan keamanan memahami peran dan tanggung jawab"
        ],
        "offerings": [
          {
            "name": "Server & Database"
          }
        ]
      },
      {
        "code": "PR.DS",
        "name": "Keamanan Data",
        "subcategories": [
          "PR.DS-01: Data-at-rest dilindungi",
          "PR.DS-02: Data-in-transit dilindungi",
          "PR.DS-03: Aset dikelola secara formal sepanjang penghapusan, transfer, dan pembuangan",
          "PR.DS-04: Kapasitas yang memadai untuk memastikan ketersediaan dipelihara",
          "PR.DS-05: Perlindungan terhadap kebocoran data diimplementasikan",
          "PR.DS-06: Mekanisme pemeriksaan integritas digunakan untuk memverifikasi integritas perangkat lunak, firmware, dan informasi",
          "PR.DS-07: Lingkungan pengembangan dan pengujian terpisah dari lingkungan produksi",
          "PR.DS-08: Mekanisme pemeriksaan integritas digunakan untuk memverifikasi integritas perangkat keras"
        ],
        "offerings": []
      },
      {
        "code": "PR.PS",
        "name": "Keamanan Platform",
        "subcategories": [
          "PR.PS-01: Rekam audit/log ditentukan, didokumentasikan, diimplementasikan, dan ditinjau sesuai dengan kebijakan",
          "PR.PS-02: Media yang dapat dilepas dilindungi dan penggunaannya dibatasi sesuai dengan kebijakan",
          "PR.PS-03: Prinsip fungsionalitas minimal dimasukkan dengan mengkonfigurasi sistem untuk menyediakan hanya kemampuan esensial",
          "PR.PS-04: Jaringan komunikasi dan kontrol dilindungi",
          "PR.PS-05: Mekanisme (misalnya, failsafe, load balancing, hot swap) diimplementasikan untuk mencapai persyaratan ketahanan dalam situasi normal dan merugikan"
        ],
        "offerings": [
          {
            "name": "Pemasangan dan Pemeliharaan Jaringan"
          }
        ]
      },
      {
        "code": "PR.IR",
        "name": "Ketahanan Infrastruktur Teknologi",
        "subcategories": [
          "PR.IR-01: Persyaratan ketahanan untuk mendukung pengiriman layanan kritis ditetapkan untuk semua keadaan operasi (misalnya, di bawah tekanan/serangan, selama pemulihan, operasi normal)",
          "PR.IR-02: Perlindungan reputasi direncanakan dan diimplementasikan",
          "PR.IR-03: Perencanaan dan proses pemulihan ditingkatkan dengan memasukkan pelajaran yang dipelajari ke dalam aktivitas masa depan",
          "PR.IR-04: Rencana pemulihan memasukkan pelajaran yang dipelajari dan tinjauan"
        ],
        "offerings": []
      }
    ]
  },
  "detect": {
    "title": "DE: Detect (Deteksi)",
    "description": "Fungsi untuk mengembangkan dan mengimplementasikan aktivitas yang tepat untuk mengidentifikasi kejadian keamanan siber.",
    "categories": [
      {
        "code": "DE.CM",
        "name": "Pemantauan Berkelanjutan",
        "subcategories": [
          "DE.CM-01: Jaringan dipantau untuk mendeteksi peristiwa keamanan siber potensial",
          "DE.CM-02: Lingkungan fisik dipantau untuk mendeteksi peristiwa keamanan siber potensial",
          "DE.CM-03: Aktivitas personel dipantau untuk mendeteksi peristiwa keamanan siber potensial",
          "DE.CM-04: Kode berbahaya terdeteksi",
          "DE.CM-05: Kode mobile yang tidak sah terdeteksi",
          "DE.CM-06: Aktivitas penyedia layanan eksternal dipantau untuk mendeteksi peristiwa keamanan siber potensial",
          "DE.CM-07: Pemantauan untuk personel, koneksi, perangkat, dan perangkat lunak yang tidak sah dilakukan",
          "DE.CM-08: Pemindaian kerentanan dilakukan"
        ],
        "offerings": [
          {
            "name": "Pengelolaan Camera Security"
          },
          {
            "name": "Vulnerability Management"
          },
          {
            "name": "Penanganan Gangguan Jaringan"
          },
          {
            "name": "Pemasangan dan Pemeliharaan Jaringan"
          },
          {
            "name": "Remote Access"
          },
          {
            "name": "Permintaan Buka Blokir Website"
          },
          {
            "name": "Server & Database"
          }
        ]
      },
      {
        "code": "DE.AE",
        "name": "Analisis Peristiwa Merugikan",
        "subcategories": [
          "DE.AE-01: Baseline operasi jaringan dan alur data yang diharapkan untuk pengguna dan sistem ditetapkan dan dikelola",
          "DE.AE-02: Peristiwa yang terdeteksi dianalisis untuk memahami target dan metode serangan",
          "DE.AE-03: Data peristiwa dikumpulkan dan dikorelasikan dari berbagai sumber dan sensor",
          "DE.AE-04: Dampak peristiwa ditentukan",
          "DE.AE-05: Ambang batas peringatan insiden ditetapkan"
        ],
        "offerings": [
          {
            "name": "Pengelolaan Camera Security"
          },
          {
            "name": "Server & Database"
          },
          {
            "name": "Pemasangan dan Pemeliharaan Jaringan"
          },
          {
            "name": "Remote Access"
          }
        ]
      }
    ]
  },
  "respond": {
    "title": "RS: Respond (Respons)",
    "description": "Fungsi untuk mengembangkan dan mengimplementasikan aktivitas yang tepat untuk mengambil tindakan terhadap kejadian keamanan siber yang terdeteksi.",
    "categories": [
      {
        "code": "RS.MA",
        "name": "Manajemen Insiden",
        "subcategories": [
          "RS.MA-01: Insiden dibatasi",
          "RS.MA-02: Insiden dimitigasi",
          "RS.MA-03: Kerentanan yang baru diidentifikasi dimitigasi atau didokumentasikan sebagai risiko yang diterima",
          "RS.MA-04: Rencana respons insiden dieksekusi selama atau setelah insiden"
        ],
        "offerings": [
          {
            "name": "Penanganan Gangguan Jaringan"
          },
          {
            "name": "Penanganan Gangguan Server"
          },
          {
            "name": "Pemasangan dan Pemeliharaan Jaringan"
          },
          {
            "name": "Remote Access"
          },
          {
            "name": "Permintaan Buka Blokir Website"
          },
          {
            "name": "Server & Database"
          }
        ]
      },
      {
        "code": "RS.AN",
        "name": "Analisis Insiden",
        "subcategories": [
          "RS.AN-01: Notifikasi dari sistem deteksi diselidiki",
          "RS.AN-02: Dampak insiden dipahami",
          "RS.AN-03: Forensik dilakukan",
          "RS.AN-04: Insiden dikategorikan konsisten dengan rencana respons",
          "RS.AN-05: Proses ditetapkan untuk menerima, menganalisis, dan menanggapi kerentanan yang diungkapkan kepada organisasi dari sumber internal dan eksternal (misalnya, pengujian internal, buletin keamanan, atau peneliti keamanan)",
          "RS.AN-06: Insiden digunakan untuk meningkatkan efektivitas deteksi"
        ],
        "offerings": []
      },
      {
        "code": "RS.CO",
        "name": "Pelaporan dan Komunikasi Respons Insiden",
        "subcategories": [
          "RS.CO-01: Personel mengetahui peran dan urutan operasi mereka ketika respons diperlukan",
          "RS.CO-02: Peristiwa dilaporkan konsisten dengan kriteria yang ditetapkan",
          "RS.CO-03: Informasi dibagikan konsisten dengan rencana respons",
          "RS.CO-04: Koordinasi dengan pemangku kepentingan terjadi konsisten dengan rencana respons",
          "RS.CO-05: Berbagi informasi sukarela terjadi dengan pemangku kepentingan eksternal untuk mencapai kesadaran situasional keamanan siber yang lebih luas"
        ],
        "offerings": [
          {
            "name": "User Support"
          }
        ]
      },
      {
        "code": "RS.MI",
        "name": "Mitigasi Insiden",
        "subcategories": [
          "RS.MI-01: Insiden dimitigasi",
          "RS.MI-02: Kerentanan yang baru diidentifikasi dimitigasi atau didokumentasikan sebagai risiko yang diterima",
          "RS.MI-03: Insiden digunakan untuk meningkatkan efektivitas deteksi"
        ],
        "offerings": [
          {
            "name": "Penanganan Gangguan Jaringan"
          },
          {
            "name": "Penanganan Gangguan Server"
          },
          {
            "name": "Remote Access"
          },
          {
            "name": "Permintaan Buka Blokir Website"
          },
          {
            "name": "Server & Database"
          }
        ]
      }
    ]
  },
  "recover": {
    "title": "RC: Recover (Pemulihan)",
    "description": "Fungsi untuk mengembangkan dan mengimplementasikan aktivitas yang tepat untuk mempertahankan rencana ketahanan dan mengembalikan kemampuan yang terganggu.",
    "categories": [
      {
        "code": "RC.RP",
        "name": "Eksekusi Rencana Pemulihan Insiden",
        "subcategories": [
          "RC.RP-01: Rencana pemulihan dieksekusi selama atau setelah insiden",
          "RC.RP-02: Aktivitas pemulihan dikomunikasikan kepada pemangku kepentingan internal dan eksternal serta tim eksekutif dan manajemen",
          "RC.RP-03: Rencana pemulihan ditingkatkan dengan memasukkan pelajaran yang dipelajari ke dalam aktivitas masa depan",
          "RC.RP-04: Strategi pemulihan diperbarui"
        ],
        "offerings": [
          {
            "name": "Back Up & Restore Data"
          },
          {
            "name": "Penanganan Gangguan Server"
          },
          {
            "name": "Pemasangan dan Pemeliharaan Jaringan"
          },
          {
            "name": "Remote Access"
          },
          {
            "name": "Permintaan Buka Blokir Website"
          },
          {
            "name": "Server & Database"
          }
        ]
      },
      {
        "code": "RC.CO",
        "name": "Komunikasi Pemulihan Insiden",
        "subcategories": [
          "RC.CO-01: Hubungan masyarakat dikelola",
          "RC.CO-02: Reputasi setelah insiden diperbaiki",
          "RC.CO-03: Aktivitas pemulihan dikomunikasikan kepada pemangku kepentingan internal dan eksternal serta tim eksekutif dan manajemen"
        ],
        "offerings": [
          {
            "name": "User Support"
          }
        ]
      }
    ]
  }
}
