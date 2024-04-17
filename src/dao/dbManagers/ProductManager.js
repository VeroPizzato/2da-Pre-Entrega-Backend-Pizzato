const ProductModel = require('../models/products')

class ProductManager {

    static #ultimoIdProducto = 1

    constructor() { }

    inicialize = async () => {
        // No hacer nada
        // Podríamos chequear que la conexión existe y está funcionando
        if (ProductModel.db.readyState !== 1) {
            throw new Error('must connect to mongodb!')
        }
        else {
            const products = await this.getProducts()
            ProductManager.#ultimoIdProducto = this.#getNuevoIdInicio(products)
        }
    }

    #getNuevoIdInicio = (products) => {
        let mayorID = 1
        products.forEach(item => {
            if (mayorID <= item.id)
                mayorID = item.id
        });
        mayorID = mayorID + 1
        return mayorID
    }

    getProducts = async (filters) => {
        try {
            
            if (!filters) {
                let filteredProducts = await ProductModel.find()
                filteredProducts = await ProductModel.paginate({}, {  lean: true })
                return filteredProducts.docs.map(d => d.toObject({ virtuals: true }))
            }

            const { limit, page, category, availability, sort } = { limit: 8, page: 1, category: 'all', availability: 1, sort: 'asc', ...filters }

            let filteredProducts = await ProductModel.find()

            // verifico si hay que filtrar por category
            if (category && category != "all") {
                filteredProducts = await ProductModel.find({ category: category })
            }

            // verifico si hay que filtrar por availability
            if (availability) {
                if (availability == 1) {
                    filteredProducts = await ProductModel.find({ stock: { $gte: 0 } })
                }
                else {
                    filteredProducts = await ProductModel.find({ stock: 0 })
                }
            }

            filteredProducts = await ProductModel.paginate({}, { limit: limit, page: page, sort: { price: sort }, lean: true })            

            return filteredProducts
            // return filteredProducts.map(d => d.toObject({ virtuals: true }))
        }
        catch (err) {
            return []
        }
    }

    getProductById = async (idProd) => {
        const producto = await ProductModel.findOne({ id: idProd })
        if (producto)
            return producto
        else {
            console.error(`Producto con ID: ${idProd} Not Found`)
            return
        }
    }

    #getNuevoId() {
        const id = ProductManager.#ultimoIdProducto
        ProductManager.#ultimoIdProducto++
        return id
    }

    soloNumYletras = (code) => {
        return (/^[a-z A-Z 0-9]+$/.test(code))
    }

    soloNumPositivos = (code) => {
        return (/^[0-9]+$/.test(code) && (code > 0))
    }

    soloNumPositivosYcero = (code) => {
        return (/^[0-9]+$/.test(code) && (code >= 0))
    }

    addProduct = async (title, description, price, thumbnail, code, stock, status, category) => {
        let product = await ProductModel.create({
            id: this.#getNuevoId(),
            title,
            description,
            price,
            thumbnail,
            code,
            stock,
            status,
            category
        })
    }

    updateProduct = async (prodId, producto) => {
        await ProductModel.updateOne({ id: prodId }, producto)
    }

    deleteProduct = async (idProd) => {
        await ProductModel.deleteOne({ id: idProd })
    }
}

module.exports = ProductManager