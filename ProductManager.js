import fs from 'fs';

class ProductManager {
  constructor(path) {
    this.path = path;
  }

  async readFile() {
    return new Promise((resolve, reject) => {
      fs.readFile(this.path, 'utf8', (err, data) => {
        if (err) {
          if (err.code === 'ENOENT') {
            // File no existe, devuelve un array vacio.
            resolve([]);
          } else {
            reject(err);
          }
        } else {
          try {
            resolve(JSON.parse(data));
          } catch (parseError) {
            reject(parseError);
          }
        }
      });
    });
  }

  async writeFile(data) {
    return new Promise((resolve, reject) => {
      fs.writeFile(this.path, JSON.stringify(data, null, 2), 'utf8', (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async addProduct(product) {
    const products = await this.readFile();

    // se genera el id autoincrementable
    const maxId = products.reduce((max, p) => (p.id > max ? p.id : max), 0);
    const newProduct = { ...product, id: maxId + 1 };

    products.push(newProduct);
    await this.writeFile(products);

    return newProduct;
  }

  async getProducts() {
    return this.readFile();
  }

  async getProductById(id) {
    const products = await this.readFile();
    const product = products.find((p) => p.id === id);

    if (!product) {
      throw new Error('Producto no encontrado');
    }

    return product;
  }

  async updateProduct(id, updatedFields) {
    const products = await this.readFile();
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) {
      throw new Error('Producto no encontrado');
    }

    products[index] = { ...products[index], ...updatedFields };
    await this.writeFile(products);

    return products[index];
  }

  async deleteProduct(id) {
    const products = await this.readFile();
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) {
      throw new Error('Producto no encontrado');
    }

    products.splice(index, 1);
    await this.writeFile(products);
  }
}

// Se realiza el testing de acuerdo a lo solicitado en el documento "DESAFÍO ENTREGABLE - PROCESO DE TESTING" con dos productos
async function testProductManager() {
  try {
    const productManager = new ProductManager('products.json');

    console.log('Products initially:', await productManager.getProducts());

    const newProduct = await productManager.addProduct({
      title: 'producto prueba',
      description: 'Este es un producto prueba',
      price: 200,
      thumbnail: 'Sin imagen',
      code: 'abc123',
      stock: 25,
    });
    console.log('Nuevo producto agregado:', newProduct);

    const newProduct2 = await productManager.addProduct({
      title: 'producto prueba2',
      description: 'Este es un producto prueba2',
      price: 500,
      thumbnail: 'Sin imagen',
      code: 'abc365',
      stock: 30,
    });
    console.log('Nuevo producto agregado:', newProduct2);

    console.log('Listado actualizado de productos:', await productManager.getProducts());

    const productById = await productManager.getProductById(newProduct.id);
    console.log('Product by ID:', productById);

    const updatedProduct = await productManager.updateProduct(newProduct.id, {
      title: 'Updated Product',
      price: 250,
    });
    console.log('Updated product:', updatedProduct);

    console.log('Products luego de updating:', await productManager.getProducts());

    await productManager.deleteProduct(newProduct.id);
    console.log('Product borrado correctamente.');

    console.log('Products luego de utilizar deleteProduct:', await productManager.getProducts());

    await productManager.deleteProduct(newProduct2.id);
    console.log('Product borrado correctamente.');

    console.log('Products luego de utilizar deleteProduct:', await productManager.getProducts());
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testProductManager();
