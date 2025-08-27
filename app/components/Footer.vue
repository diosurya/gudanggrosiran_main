<script setup lang="ts">
// by Dio Putra
// Agustus 2025
// https://github.com/diosurya


import { ref, onMounted, onUnmounted } from "vue"

const showButton = ref(false)

const handleScroll = () => {
  showButton.value = window.scrollY > 300 
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" })
}

onMounted(() => {
  window.addEventListener("scroll", handleScroll)
})

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll)
})
</script>

<template>
  <footer class="pt-5 mt-5 border-top position-relative">
    <div class="container">
      <div class="row">
        <!-- Brand -->
        <div class="col-md-3 mb-4">
          <h5 class="fw-bold text-main">Gudang Grosiran</h5>
          <p class="small">
            Belanja kebutuhan grosir dengan harga terbaik, mudah, dan cepat.
          </p>
        </div>

        <!-- Navigation -->
        <div class="col-md-3 mb-4">
          <h6 class="fw-semibold mb-3">Navigasi</h6>
          <ul class="list-unstyled small">
            <li><a href="/" class="text-black text-decoration-none">Beranda</a></li>
            <li><a href="/produk" class="text-black text-decoration-none">Produk</a></li>
            <li><a href="/tentang" class="text-black text-decoration-none">Tentang Kami</a></li>
            <li><a href="/kontak" class="text-black text-decoration-none">Kontak</a></li>
          </ul>
        </div>

        <!-- Support -->
        <div class="col-md-3 mb-4">
          <h6 class="fw-semibold mb-3">Bantuan</h6>
          <ul class="list-unstyled small">
            <li><a href="/faq" class="text-black text-decoration-none">FAQ</a></li>
            <li><a href="/kebijakan-privasi" class="text-black text-decoration-none">Kebijakan Privasi</a></li>
            <li><a href="/syarat-ketentuan" class="text-black text-decoration-none">Syarat & Ketentuan</a></li>
            <li><a href="/pengiriman" class="text-black text-decoration-none">Pengiriman</a></li>
          </ul>
        </div>

        <!-- Social -->
        <div class="col-md-3 mb-4">
          <h6 class="fw-semibold mb-3">Ikuti Kami</h6>
          <div class="d-flex gap-3">
            <a href="#" class="text-black fs-5"><i class="bi bi-facebook"></i></a>
            <a href="#" class="text-black fs-5"><i class="bi bi-instagram"></i></a>
            <a href="#" class="text-black fs-5"><i class="bi bi-twitter"></i></a>
            <a href="#" class="text-black fs-5"><i class="bi bi-linkedin"></i></a>
          </div>
        </div>
      </div>

      <!-- Bottom -->
      <div class="border-top border-secondary text-center py-3 mt-3">
        <p class="mb-0 small">
          © 2025 Gudang Grosiran. All rights reserved.
        </p>
        <p class="mb-0 small">
          Crafted by
          <a
            href="https://github.com/diosurya"
            target="_blank"
            class="text-main text-decoration-none fw-bold"
          >
            Dio Putra
          </a>
        </p>
      </div>
    </div>

    <!-- Back to Top Button -->
    <button
      v-show="showButton"
      @click="scrollToTop"
      class="btn btn-main bg-main text-white position-fixed bottom-0 end-0 m-4 shadow"
      style="border-radius: 50%; width: 45px; height: 45px;"
      aria-label="Back to Top"
    >
      <i class="bi bi-arrow-up"></i>
    </button>
  </footer>
</template>
