import styles from './content.module.scss'
import { Col } from "antd"
import { Routes, Route } from "react-router-dom";
import Dashboard from "./../fetched_collections/dashboard/dashboard";
import Products from "./../fetched_collections/products/products";
import Locations from "./../fetched_collections/locations/locations";
import Orders from "./../fetched_collections/orders/orders";

function Content() {

  return (
    <>
      <Col span={20} className={styles.rightContainer}>
      <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/locations" element={<Locations />} />
          <Route path="/orders" element={<Orders />} />
        </Routes>
      </Col>
    </>
  );
}

export default Content;