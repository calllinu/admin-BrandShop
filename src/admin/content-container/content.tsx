import styles from './content.module.scss'
import { Col } from "antd"

function Content() {
  return (
    <>
        <Col span={20} className={styles.rightContainer}>
            content
        </Col>
    </>
  )
}

export default Content