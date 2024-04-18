const { Router } = require('express')
const router = Router()
const { validarNuevoProducto } = require('./products')

router.get('/products', async (req, res) => {
    try {
        const ProductManager = req.app.get('ProductManager')
        let products = await ProductManager.getProducts(req.query)

        res.render('home', {
            title: 'Home',
            styles: ['productos.css'],
            products
        })
    } catch (error) {
        console.error('Error al al cargar los productos:', error)
    }
})

router.get('/products/detail/:pid', async (req, res) => {
    try {
        const ProductManager = req.app.get('ProductManager')

        const prodId = req.params.pid
        const product = await ProductManager.getProductById(prodId)

        let data = {
            title: 'Product Detail',
            scripts: ['productoDetail.js'],
            useSweetAlert: true,
            styles: ['productos.css'],
            useWS: false,
            product
        }

        res.render('detail', data)
    }
    catch (err) {
        return res.status(500).json({ message: err.message })
    }
})

router.get('/products/addCart/:pid', async (req, res) => {
    try {
        const CartManager = req.app.get('CartManager')        
        const prodId = req.params.pid        
        //agrego una unidad del producto al primer carrito que siempre existe
        const carts = await CartManager.getCarts()
        // console.log(JSON.stringify(carts, null, '\t'))     
        await CartManager.addProductToCart(carts[0]._id, prodId, 1);       
    }
    catch (err) {
        return res.status(500).json({ message: err.message })
    }
})

router.get('/realtimeproducts', async (req, res) => {
    try {
        const ProductManager = req.app.get('ProductManager')
        const products = await ProductManager.getProducts(req.query)
        res.render('realTimeProducts', {
            title: 'Productos en tiempo real',
            styles: ['productos.css'],
            products,
            useWS: true,
            scripts: [
                'realTimeProducts.js'
            ]
        })
    } catch (error) {
        console.error('Error al al cargar los productos en tiempo real:', error)
    }
})

router.post('/realtimeproducts', validarNuevoProducto, async (req, res) => {
    try {
        const ProductManager = req.app.get('ProductManager')
        const product = req.body
        // Agregar el producto en el ProductManager
        // Convertir el valor status "true" o "false" a booleano        
        var boolStatus = JSON.parse(product.status)
        product.thumbnail = ["/images/" + product.thumbnail]
        product.price = +product.price
        product.stock = +product.stock
        await ProductManager.addProduct(
            product.title,
            product.description,
            +product.price,
            product.thumbnail,
            product.code,
            +product.stock,
            boolStatus,
            product.category)
        // Notificar a los clientes mediante WS que se agrego un producto nuevo             
        req.app.get('ws').emit('newProduct', product)
        res.redirect('/realtimeproducts')
        // res.status(201).json({ message: "Producto agregado correctamente" })
    } catch (error) {
        console.error('Error al agregar el producto:', error)
    }
})

router.get('/newProduct', async (_, res) => {
    res.render('newProduct', {
        title: 'Nuevo Producto',
    })
})

router.get('/chat', (_, res) => {
    res.render('chat', {
        title: 'Aplicación de chat',
        useWS: true,
        useSweetAlert: true,
        scripts: [
            'chat.js'
        ]
    })
})


module.exports = router