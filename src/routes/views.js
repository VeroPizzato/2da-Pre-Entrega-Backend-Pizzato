const { Router } = require('express')
const router = Router()
const productModel = require('../dao/models/products')
const cartModel = require('../dao/models/cart')
const { validarNuevoProducto } = require('./products')

router.get('/products', async (req, res) => {
    try {
        const ProductManager = req.app.get('ProductManager')
        let products = await ProductManager.getProducts(req.query)
        // let page = +req.query.page || 1
        // products = await productModel.paginate({}, {limit: 4, page, lean: true})  // el parametro lean convierte documento a objeto
        //console.log(products)

        res.render('home', {
            title: 'Home',
            styles: ['productos.css'],
            products
        })
    } catch (error) {
        console.error('Error al al cargar los productos:', error)
    }
})

// router.get('/home', async (req, res) => {
//     try {
//         const ProductManager = req.app.get('ProductManager')
//         const products = await ProductManager.getProducts(req.query)
//         res.render('home', {
//             title: 'Home',
//             styles: ['productos.css'],
//             products
//         })
//     } catch (error) {
//         console.error('Error al al cargar los productos:', error)
//     }
// })

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


// VER POPULATION !!
router.get('/carts/:cid', async (req, res) => {
    try {
        const { cid } = req.params;        
        let carrito = await cartModel.findOne({ _id: cid }).populate('arrayCart.productId');
                
        // //let totalCarrito = 0;
        // const cartItems = carrito.arrayCart.map(item => {
        //     //const subtotal = item.quantity * item.product.price;
        //     //totalCarrito += subtotal;
        //     return {
        //         title: item.productId.title,
        //         description : item.productId.description,
        //         price: item.productId.price,
        //         quantity: item.quantity,
        //         id: item._id,
        //         thumbnail: item.productId.thumbnail,
        //         code: item.productId.code,
        //         stock: item.productId.stock,
        //         //subtotal: subtotal,
        //     };
        // });

        // //console.log(cartItems, totalCarrito); 
        // console.log(cartItems)     

    } catch (error) {
        console.log(error);
    }
});


module.exports = router