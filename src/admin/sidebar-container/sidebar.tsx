import styles from './sidebar.module.scss';
import { Col, Flex, Row } from "antd";
import { DashboardOutlined, ShoppingOutlined, EnvironmentOutlined } from "@ant-design/icons";

function Sidebar() {
    const collections: { label: string; icon: JSX.Element }[] = [
        { label: "Dashboard", icon: <DashboardOutlined /> },
        { label: "Products", icon: <ShoppingOutlined /> },
        { label: "Locations", icon: <EnvironmentOutlined /> },
    ];

    return (
        <>
            <Col span={4} className={styles.leftContainer}>
                <Col className={styles.firstColumn}>
                    <Row className={styles.details}>
                        <Flex>
                            <Col className={styles.icon}>
                                <ShoppingOutlined />
                            </Col>
                            <Col className={styles.name}>
                                BrandShop
                            </Col>
                        </Flex>
                    </Row>
                    <Col className={styles.items}>
                        {collections.map(({ label, icon }, index) => (
                            <Row key={index} className={styles.rows}>
                                <Flex>
                                    <Col className={styles.icon}>
                                        {icon}
                                    </Col>
                                    <Col className={styles.collection}>
                                        {label}
                                    </Col>
                                </Flex>
                            </Row>
                        ))}
                    </Col>
                </Col>
            </Col>
        </>
    );
}

export default Sidebar;
