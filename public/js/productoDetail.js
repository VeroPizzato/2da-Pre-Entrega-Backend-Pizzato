document.addEventListener("DOMContentLoaded", function () {
    document.querySelector(".btn-confirmar").addEventListener("click", function () {
        // Muestro mensaje alerta que se agrego producto al carrito
        Swal.fire({
            icon: "success",
            title: 'Compra confirmada',
            text: 'Producto agregado al carrito exitosamente!'
        })
    })
})
