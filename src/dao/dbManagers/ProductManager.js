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
            const products = await this.getProducts({})
            ProductManager.#ultimoIdProducto = this.#getNuevoIdInicio(products.docs)
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
            
            if (JSON.stringify(filters) === '{}') {  // vienen vacios los filtros             
                let allProducts = await ProductModel.find()
                allProducts = await ProductModel.paginate({}, {  lean: true })
                return allProducts
            }            

            const { limit, page, category, availability, sort } = { limit: 10, page: 1, category: 'notebook', availability: 1, sort: 'asc', ...filters } // availability 1 (con stock) y 0 (sin stock)

            let allProducts = await ProductModel.find()

            if (availability == 1) {
                allProducts = await ProductModel.paginate({ category: category, stock: { $gt: 0 }}, {}, { limit: limit, page: page, sort: { price: sort }, lean: true })
            }
            else {
                allProducts = await ProductModel.paginate({ category: category, stock: 0 }, {}, { limit: limit, page: page, sort: { price: sort }, lean: true })
            }       

            return allProducts
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