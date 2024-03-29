import { Row, Col, Button, Modal, Spin, Input, Select } from 'antd';
import styles from './products.module.scss';
import { PlusOutlined, EditOutlined, DeleteOutlined} from "@ant-design/icons";
import { useState, useEffect, useRef } from 'react';
import { storage } from '../../firebaseConfig/firebaseConfig';
import { getDocs, collection, query,  doc, setDoc, deleteDoc } from 'firebase/firestore';
import { database } from '../../firebaseConfig/firebaseConfig'; 
import { CategoryData, ProductInterface, Products } from '../../interfaces/interfaces';
import { getDownloadURL, ref, deleteObject, uploadBytes, list} from 'firebase/storage';
import { Formik, Field, Form, ErrorMessage, FormikProps } from 'formik';
import * as Yup from 'yup';

function Products() {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [products, setProducts] = useState<Products[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [deleteProductLoading, setLoadingDeleteProduct] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Products | null>(null);
  const [editProduct, setEditProduct] = useState<Products[]>([]);
  // const [isEditMode, setIsEditMode] = useState(false);
  const [currency, setCurrency] = useState<string[] | null>(null);
  const allSubcategories = categories.flatMap((cat) => cat.subcategories ?? []);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const collectionCat = collection(database, "categories");
  const collectionProducts = collection(database, "products");
  const collectionLocations = collection(database, "location-countries")
  const formikRef = useRef<FormikProps<ProductInterface> | null>(null);
  const {Search} = Input;
  const [formKey, setFormKey] = useState(0);

  const fetchCategories = async () => {
    try {
      const categoryResponse = await getDocs(collectionCat);
  
      const categoryData = await Promise.all(
        categoryResponse.docs.map(async (categoryDoc) => {
          const category = categoryDoc.data() as CategoryData;
          const subcategoriesCollection = collection(
            database,
            `categories/${categoryDoc.id}/subcategories`
          );
          const subcategoriesQuery = query(subcategoriesCollection);
          const subcategoriesSnapshot = await getDocs(subcategoriesQuery);
  
          const subcategories = subcategoriesSnapshot.docs.map((subcatDoc) => ({
            id: subcatDoc.id,
            ...subcatDoc.data(),
          }));
  
          return {
            ...category,
            subcategories,
          };
        })
      ) as CategoryData[];
  
      setCategories(categoryData);
      setCategoriesLoading(false);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };
  
  const fetchProducts = async () => {
    try {
      const productsRef = await getDocs(collectionProducts);
  
      const ProductDataPromises: (Products | null)[] = await Promise.all(
        productsRef.docs.map(async (doc) => {
          try {
            return {
              id: doc.id,
              name: doc.data().name,
              discount: doc.data().discount,
              series: doc.data().series,
              photos: doc.data().photo, 
              color: doc.data().color,
              price: doc.data().price,
              size: doc.data().size,
              categoryID: doc.data().categoryID,
              description: doc.data().description,
              currency: doc.data().currency,
            };
          } catch (photoError) {
            console.error('Error fetching photo URL:', photoError);
            return null;
          }
        })
      );
  
      const validProductData = ProductDataPromises.filter((product): product is Products => product !== null);
      setEditProduct(validProductData);
      setProducts(validProductData);
      setProductsLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCurrency = async () => {
    try {
      const currencyData = await getDocs(collectionLocations);
      const currencyArray = currencyData.docs.map(doc => doc.data().currency);
      setCurrency(currencyArray);
    } catch (error) {
      console.error('Error fetching currency:', error);
    }
  }; 

  const deleteProduct = async (productId: string) => {
    try {
      setLoadingDeleteProduct(true);
      await deleteDoc(doc(collectionProducts, productId));
  
      const folderRef = ref(storage, `products/${productId}/`);
      const files = await list(folderRef);
      await Promise.all(files.items.map(async (fileRef) => {
        await deleteObject(fileRef);
      }));
  
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    } finally {
      setLoadingDeleteProduct(false);
    }
  };  

  const showModalConfirmDelete = (product: Products) => {
    setSelectedProduct(product);
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    if (selectedProduct) {
      await deleteProduct(selectedProduct.id);
      setLoadingDeleteProduct(false);
      setIsModalVisible(false);
    }
  };

  const handleCancelConfirmDelete = () => {
    setIsModalVisible(false);
  };
    
  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchCurrency();
  }, []);        

  const showModal = () => {   
    setOpen(true);
  };

  const openModalForEdit = (productId: string) => {
    const selectedProduct = editProduct.find((product) => product.id === productId);
  
    if (selectedProduct) {
      setSelectedProduct(selectedProduct);
      // setIsEditMode(true);
      setOpen(true);
    }
  }; 

  const handleCancel = async () => {
    setOpen(false);
    if (formikRef.current) {
      await formikRef.current.resetForm();
      setFormKey((prevKey) => prevKey + 1);
    }
  }

  const handleSubmit = async () => {
    if (formikRef.current) {
      await formikRef.current.submitForm();
      setFormKey((prevKey) => prevKey + 1);
    }
  }

  const columnDescriptions = [
    { label: 'Product ID', span: 3 },
    { label: 'Category', span: 3 },
    { label: 'Name', span: 4 },
    { label: 'Series', span: 2 },
    { label: 'Discount', span: 2 },
    { label: 'Color', span: 3 },
    { label: 'Size', span: 2 },
    { label: 'Price', span: 2 },
    { label: 'Edit', span: 1 },
    { label: 'Delete', span: 2 },
  ];  
   
  return (
    <>
      <Row className={styles.main} gutter={[10,10]}>
          <Col span={12} className={styles.title}>
            Products
          </Col>
          <Col span={12} className={styles.addButton}>
            <Button type='primary' onClick={showModal}>
                <PlusOutlined/>
                Add Product
            </Button>
              <Modal
                open={open}
                onCancel={handleCancel}
                footer={[
                <div key="actions">
                  <Button key="cancel" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button key="submit" type='primary' loading={loading} onClick={handleSubmit}>
                    Add Product
                  </Button>
                </div>
                ]}
                className={styles.modal}
                >
                  <Row className={styles.form}>
                    <Formik
                        key={formKey} 
                        innerRef={(formik) => (formikRef.current = formik)}
                        initialValues={{
                          name:  "",
                          discount:  "",
                          series:  "",
                          color:  "",
                          size:  "",
                          price: "",
                          categoryID:  "",
                          photo: null as FileList | null,
                          currency : "",
                          description: "",
                        }}                        

                        onSubmit={async (values, { resetForm }) => {
                          setLoading(true);
                          let photoURLs = [];
                        
                          try {
                            if (values.photo && values.photo.length > 0) {
                              // Generate a unique ID for the product document
                              const productRef = doc(collection(database, 'products'));
                              const productID = productRef.id;
                        
                              // Update the path to include the product ID
                              photoURLs = await Promise.all(
                                Array.from(values.photo).map(async (photo) => {
                                  const photoPath = `/products/${productID}/${photo.name}`;
                                  const storageRef = ref(storage, photoPath);
                        
                                  await uploadBytes(storageRef, photo);
                                  const downloadURL = await getDownloadURL(storageRef);
                                  return downloadURL;
                                })
                              );
                        
                              // Use the generated product ID as the document ID
                              await setDoc(productRef, {
                                name: values.name,
                                discount: Number(values.discount),
                                series: values.series,
                                color: values.color,
                                size: values.size,
                                price: values.price,
                                categoryID: values.categoryID,
                                photos: photoURLs,
                                description: values.description,
                                currency: values.currency,
                              });
                        
                              fetchProducts();
                              resetForm();
                              setOpen(false);
                              setLoading(false);
                            }
                          } catch (error) {
                            console.error('Error adding product:', error);
                            setLoading(false);
                          }
                        }}
                                  

                        validationSchema={
                          Yup.object({
                              name: Yup.string().required("Required"),
                              discount: Yup.number().required("Required"),
                              series: Yup.string().required("Required"),
                              color: Yup.string().required("Required"),
                              size: Yup.string().required("Required"),
                              price: Yup.string().required("Required"),
                              categoryID: Yup.string().required("Required"),
                              photo: Yup.mixed().required("Required"),
                              description: Yup.string().required("Required"),
                              currency: Yup.string().required("Required"),
                          })}
                        >

                  {({ values, handleChange, handleBlur, setFieldValue}) => (
                    <Form>
                      <Row>
                        <Col span={12}>Category</Col>  
                        <Col span={12}>Name</Col>
                      </Row>
                      <Row>
                        <Col span={12}>
                        <Field 
                          as="select"
                          name="categoryID"
                          value={values.categoryID}
                          onBlur={handleBlur}
                          onChange={handleChange}
                          className={styles.custom}
                        >
                          <option value="" label="Select a subcategory" />
                          {categories
                            .flatMap((category) => category.subcategories ?? [])
                            .map((subcat) => (
                              <option key={subcat.id} value={subcat.id} label={subcat.name} className={styles.option}/>
                            ))}
                        </Field>
                        <ErrorMessage className={styles.error} name='categoryID' component="div" />
                        </Col>
                        <Col span={12}>
                          <Field
                            type="text"
                            name="name"
                            value={values.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={styles.custom}
                          />
                          <ErrorMessage className={styles.error} name='name' component="div" />
                        </Col>
                      </Row>

                      <Row>
                        <Col span={12}>Series</Col>  
                        <Col span={12}>Discount</Col>
                      </Row>
                      <Row>
                        <Col span={12}>
                          <Field
                            type="text"
                            name="series"
                            value={values.series}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={styles.custom}
                          />
                          <ErrorMessage className={styles.error} name='series' component="div" />
                        </Col>
                        <Col span={12}>
                          <Field
                            type="number"
                            name="discount"
                            value={values.discount}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={styles.custom}
                          />
                          <ErrorMessage className={styles.error} name='discount' component="div" />
                        </Col>
                      </Row>      

                      <Row>
                        <Col span={12}>Size</Col>  
                        <Col span={12}>Color</Col>
                      </Row>
                      <Row>
                        <Col span={12}>
                          <Field
                            type="text"
                            name="size"
                            value={values.size}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={styles.custom}
                          />
                          <ErrorMessage className={styles.error} name='size' component="div" />
                        </Col>
                        <Col span={12}>
                          <Field
                            type="text"
                            name="color"
                            value={values.color}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={styles.custom}
                          />
                          <ErrorMessage className={styles.error} name='color' component="div" />
                        </Col>
                      </Row>   

                        <Row>
                          <Col span={12}>Price</Col>  
                          <Col span={5}>Currency</Col>
                        </Row>
                        <Row>
                          <Col span={12}>
                            <Field
                              type="text"
                              name="price"  
                              value={values.price}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              className={styles.custom}
                            />
                          <ErrorMessage className={styles.error} name='price' component="div" />
                          </Col>
                          <Col span={5}>
                          <Field 
                            as="select"
                            name="currency"
                            value={values.currency}
                            onBlur={handleBlur}
                            onChange={handleChange}
                          >
                            <option value="" label="Select the currency" />
                            {currency && [...new Set(currency)].map((currencyValue) => (
                              <option key={currencyValue} value={currencyValue} label={currencyValue} className={styles.option} />
                            ))}
                          </Field>
                          <ErrorMessage className={styles.error} name='currency' component="div"/>
                          </Col>
                          </Row>
                          <Row>
                          <Col span={12}>Description</Col>
                          </Row>
                          <Row>
                            <Col span={24}>
                              <textarea
                                rows={5}
                                name="description"
                                className={styles.textarea}
                                value={values.description}
                                onChange={handleChange}
                                onBlur={handleBlur}
                              />
                              <ErrorMessage className={styles.error} name='description' component="div" />
                            </Col>
                          </Row>      
                        <Row>
                          <Col span={24}>
                              Photo
                          </Col>
                          <Col span={24}>
                          <input
                            type="file"
                            name="photo"
                            onChange={(e) => setFieldValue("photo", e.currentTarget.files ? e.currentTarget.files : null)}
                            onBlur={handleBlur}
                            accept='.jpg, .jpeg, .png'
                            multiple
                          />
                          </Col>
                          <Col span={24}>
                            <ErrorMessage className={styles.error} name='photo' component="div" />
                          </Col>
                        </Row>  

                      </Form>
                      )}
                      </Formik>
                  </Row>
              </Modal>
              <Modal
                title="Confirm Delete"
                open={isModalVisible}
                onCancel={handleCancelConfirmDelete}
                footer={[
                  <Col key="footer">
                    <Button key="delete" loading={loading} onClick={handleCancelConfirmDelete}>
                      Cancel
                    </Button>
                    <Button key="submit" type='primary' loading={deleteProductLoading} onClick={handleOk}>
                      Delete Product
                    </Button>
                  </Col>
                  
                ]}
                >
                Are you sure for deleting ?
              </Modal>
            </Col>
        <Col span={12} offset={12}>
          <Row>
            <Col span={12} className={styles.subCategoryOption}>
                <Select 
                    placeholder="Select subcategory" 
                    style={{width: '200px'}}
                    onChange={(value) => setSelectedCategory(value)}
                >
                  {allSubcategories
                    .map((subcat) => (
                      <Select.Option key={subcat.id} value={subcat.name} label={subcat.name}>
                        {subcat.name}
                      </Select.Option>
                    ))}
                </Select>
            </Col>
            <Col span={12}>
              <Search
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Search for product name...'
                enterButton                    
              />
            </Col>
          </Row>
        </Col>       
      </Row>
      <div className={styles.block}>
        <Row>
          {columnDescriptions.map((column, index) => (
            <Col key={index} span={column.span} className={styles.columnDescriptions}>
              {column.label}
            </Col>
          ))}
        </Row>
        {productsLoading ? (
          <Row>
            <Col span={24} className={styles.spinnerContainer}>
              <Spin size="default" />
            </Col>
          </Row>
        ) : (
          products
          .filter((item) => (
            (search.toLowerCase() === '' || item.name.toLowerCase().includes(search)) &&
            (selectedCategory === '' || allSubcategories.some(subcat => subcat.id === item.categoryID && subcat.name === selectedCategory))
          )).map((product, index) => {
          const subcategory = allSubcategories.find((subcat) => subcat.id === product.categoryID);
          const subcategoryName = subcategory ? subcategory.name : "";
            return (
              <Row
                key={product.id}
                className={`${styles.productRow} ${
                  index % 2 === 1 ? styles.oddRow : ''
                }`}
              >
                <Col span={3} className={styles.partialId}>
                  <span className={styles.visiblePart}>{product.id.slice(0, 3)}</span>
                  <span className={styles.partialVisiblePart}>{product.id.slice(3, 8)}</span>
                  <span className={styles.partialVisiblePartSecond}>{product.id.slice(8, 11)}</span>
                  <span className={styles.partialVisiblePartSecond}>...</span>
                  <span className={styles.invisiblePart}>{product.id.slice(11)}</span>
                </Col>
                <Col span={3}>
                  {categoriesLoading ? (
                    <Spin size='small' className={styles.spin}/>
                  ) : (
                    subcategoryName
                  )}
                </Col>
                <Col span={4}>{product.name}</Col>
                <Col span={2}>{product.series}</Col>
                <Col span={2} className={styles.discount}>
                  {product.discount}
                </Col>
                <Col span={3} className={styles.color}>{product.color}</Col>
                <Col span={2}>{product.size}</Col>
                <Col span={2}>
                  {product.price} {product.currency && product.currency.split(',')[1]}
                </Col>
                <Col span={1} className={styles.icon}>
                  <EditOutlined onClick={() => openModalForEdit(product.id)}/>
                </Col>
                <Col span={2} className={styles.icon} onClick={() => showModalConfirmDelete(product)}>
                  <DeleteOutlined />
                </Col>
              </Row>
            );
          })
        )}
      </div>
    </>
  );
}

export default Products;
