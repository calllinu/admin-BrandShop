import { Row, Col, Button, Modal, Spin } from 'antd';
import styles from './products.module.scss';
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useState, useEffect } from 'react';
import { storage } from './../../firebaseConfig/firebaseConfig';
import { getDocs, collection, query, addDoc } from 'firebase/firestore';
import { database } from './../../firebaseConfig/firebaseConfig'; 
import { CategoryData, Products } from './../../interfaces/interfaces';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useFormik } from 'formik';
import * as Yup from 'yup';

function Products() {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);
  const [products, setProducts] = useState<Products[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const collectionCat = collection(database, "categories");
  const collectionProducts = collection(database, "products");

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
              photo: doc.data().photo, 
              color: doc.data().color,
              price: doc.data().price,
              size: doc.data().size,
              categoryID: doc.data().categoryID,
              description: doc.data().description,
            };
          } catch (photoError) {
            console.error('Error fetching photo URL:', photoError);
            return null;
          }
        })
      );
  
      const validProductData = ProductDataPromises.filter((product): product is Products => product !== null);
  
      setProducts(validProductData);
      setProductsLoading(false);
      console.log(validProductData);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };
  
  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);
  
      

  const formik = useFormik({
    initialValues: {
      name: "",
      discount: "",
      series: "",
      color: "",
      size: "",
      price: "",
      categoryID: "",
      photo: null as File | null,
      description: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Required"),
      discount: Yup.number().required("Required"),
      series: Yup.string().required("Required"),
      color: Yup.string().required("Required"),
      size: Yup.string().required("Required"),
      price: Yup.string().required("Required"),
      categoryID: Yup.string().required("Required"),
      photo: Yup.mixed().required("Required"),
      description: Yup.string().required("Required"),
    }),

    onSubmit: async (values ) => {
      setLoading(true);
    
      try {
        if (values.photo) {
          const photoPath = `/watches/${values.photo.name}`;
          const storageRef = ref(storage, photoPath);
          await uploadBytes(storageRef, values.photo);
          const photoURL = await getDownloadURL(storageRef);
    
          await addDoc(collection(database, 'products'), {
            name: values.name,
            discount: Number(values.discount),
            series: values.series,
            color: values.color,
            size: values.size,
            price: values.price,
            categoryID: values.categoryID,
            photo: photoURL, 
            description: values.description,
          });
    
          fetchProducts();
    
          formik.resetForm();
          setOpen(false);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error adding product:', error);
        setLoading(false);
      }
    }

    
  });

  const showModal = () => {
    setOpen(true);
  }

  const handleCancel = () => {
    setOpen(false);
    formik.resetForm();
  }

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    formik.handleSubmit();  
  };  

  const columnDescriptions = [
    { label: 'Product ID', span: 3 },
    { label: 'Category', span: 3 },
    { label: 'Name', span: 3 },
    { label: 'Series', span: 2 },
    { label: 'Discount', span: 2 },
    { label: 'Color', span: 3 },
    { label: 'Size', span: 3 },
    { label: 'Price', span: 2 },
    { label: 'Edit', span: 1 },
    { label: 'Delete', span: 1 },
  ];
 
  return (
    <>
      <Row className={styles.main}>
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
            onOk={handleSubmit}
            onCancel={handleCancel}
            footer={[
              <Button key="submit" type='primary' loading={loading} onClick={handleSubmit}>
                Add Product
              </Button>
            ]}
            className={styles.modal}
            >
              <Row className={styles.form}>
                <form onSubmit={formik.handleSubmit}>
                  <Row>
                    <Col span={12}>Category</Col>  
                    <Col span={12}>Name</Col>
                  </Row>
                  <Row>
                    <Col span={12}>
                    <select
                      name="categoryID"
                      value={formik.values.categoryID}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    >
                      <option value="" label="Select a subcategory" />
                      {categories
                        .flatMap((category) => category.subcategories ?? [])
                        .map((subcat) => (
                          <option key={subcat.id} value={subcat.id} label={subcat.name} className={styles.option}/>
                        ))}
                    </select>
                    {formik.touched.categoryID? (
                      <div className={styles.error}>{formik.errors.categoryID}</div>
                    ) : null}
                    </Col>
                    <Col span={12}>
                      <input
                        type="text"
                        name="name"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      {formik.touched.name? (
                        <Row className={styles.error}>{formik.errors.name}</Row>
                      ) : null}
                    </Col>
                  </Row>

                  <Row>
                    <Col span={12}>Series</Col>  
                    <Col span={12}>Discount</Col>
                  </Row>
                  <Row>
                    <Col span={12}>
                      <input
                        type="text"
                        name="series"
                        value={formik.values.series}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      {formik.touched.series? (
                        <div className={styles.error}>{formik.errors.series}</div>
                      ) : null}
                    </Col>
                    <Col span={12}>
                      <input
                        type="number"
                        name="discount"
                        value={formik.values.discount}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      {formik.touched.discount? (
                        <div className={styles.error}>{formik.errors.discount}</div>
                      ) : null}
                    </Col>
                  </Row>      

                  <Row>
                    <Col span={12}>Size</Col>  
                    <Col span={12}>Color</Col>
                  </Row>
                  <Row>
                    <Col span={12}>
                      <input
                        type="text"
                        name="size"
                        value={formik.values.size}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
              
                      />
                      {formik.touched.size? (
                        <div className={styles.error}>{formik.errors.size}</div>
                      ) : null}
                    </Col>
                    <Col span={12}>
                      <input
                        type="text"
                        name="color"
                        value={formik.values.color}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
          
                      />
                      {formik.touched.color? (
                        <div className={styles.error}>{formik.errors.color}</div>
                      ) : null}
                    </Col>
                  </Row>   

                    <Row>
                      <Col span={12}>Price</Col>  
                    </Row>
                    <Row>
                      <Col span={12}>
                        <input
                          type="text"
                          name="price"
                          value={formik.values.price}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                  
                        />
                        {formik.touched.price? (
                          <div className={styles.error}>{formik.errors.price}</div>
                        ) : null}
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
                          value={formik.values.description}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className={styles.textarea}
                        />
                        {formik.touched.description? (
                          <div className={styles.error}>{formik.errors.description}</div>
                        ) : null}
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
                            onChange={(e) => formik.setFieldValue("photo", e.currentTarget.files ? e.currentTarget.files[0] : null)}
                            onBlur={formik.handleBlur}
                            accept='.jpg, .jpeg, .png'
                        />
                      </Col>
                      <Col span={24}>
                        {formik.touched.photo? (
                            <div className={styles.error}>{formik.errors.photo}</div>
                          ) : null}
                      </Col>
                    </Row>         
                  </form>
              </Row>
            </Modal>
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
          products.map((product, index) => {
            const subcategory = categories
              .flatMap((cat) => cat.subcategories ?? [])
              .find((subcat) => subcat.id === product.categoryID);
        
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
                  <span className={styles.partialVisiblePartSecond}>{product.id.slice(8, 12)}</span>
                  <span className={styles.invisiblePart}>{product.id.slice(12)}</span>
                </Col>
                <Col span={3}>{subcategoryName}</Col>
                <Col span={3}>{product.name}</Col>
                <Col span={2}>{product.series}</Col>
                <Col span={2} className={styles.discount}>
                  {product.discount}
                </Col>
                <Col span={3}>{product.color}</Col>
                <Col span={3}>{product.size}</Col>
                <Col span={2}>{product.price}</Col>
                <Col span={1} className={styles.icon}>
                  <EditOutlined />
                </Col>
                <Col span={1} className={styles.icon}>
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
