import { Row } from "antd"
import styles from './admin-pannel.module.scss'
import Sidebar from "../sidebar-container/sidebar"
import Content from "../content-container/content"

function Admin() {

  return (
    <Row className={styles.mainContainer}>
      <Sidebar/>
      <Content/>
    </Row>
  )
}

export default Admin