import { Col, Flex, Row } from "antd"
import styles from './admin-pannel.module.scss'
import { DownOutlined, ShoppingOutlined } from "@ant-design/icons"

function Admin() {
  return (
    <Row className={styles.mainContainer}>
      <Col span={4} className={styles.leftContainer}>
        <Col className={styles.firstColumn}>
          <Row className={styles.details}>
            <Flex>
              <Col className={styles.icon}>
                <ShoppingOutlined/>
              </Col>
              <Col className={styles.name}>
                BrandShop
              </Col>
            </Flex>
            <Col>
            <DownOutlined className={styles.downArrowIcon}/>
            </Col>
          </Row>
        </Col>
      </Col>
      <Col span={20} className={styles.rightContainer}>
        asf
      </Col>
    </Row>
  )
}

export default Admin