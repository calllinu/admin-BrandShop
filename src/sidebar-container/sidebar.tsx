import styles from './sidebar.module.scss';
import { Col, Flex, Row } from "antd";
import { Link } from "react-router-dom";
import { DashboardOutlined, 
         ShoppingOutlined, 
         EnvironmentOutlined, 
         ShoppingCartOutlined 
} from "@ant-design/icons";
import { useState } from 'react';

function Sidebar() {
    const collections: { label: string; icon: JSX.Element }[] = [
        { label: "Dashboard", icon: <DashboardOutlined /> },
        { label: "Orders", icon: <ShoppingCartOutlined /> },
        { label: "Products", icon: <ShoppingOutlined /> },
        { label: "Locations", icon: <EnvironmentOutlined /> },
    ];

    const [activeIndex, setActiveIndex] = useState(-1);

    const handleActive = (index: number) => {
        setActiveIndex(index === activeIndex ? -1 : index);
    }

    return (
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
                    <Link key={index} to={`/${label.toLowerCase()}`}>
                        <Row
                        className={`${index === activeIndex ? styles.active : styles.rows}`}
                        onClick={() => handleActive(index)}>
                        <Flex>
                            <Col className={styles.icon}>
                                {icon}
                            </Col>
                            <Col className={styles.collection}>
                                {label}
                            </Col>
                        </Flex>
                        </Row>
                    </Link>
                    ))}
                </Col>
            </Col>
        </Col>
    );
}

export default Sidebar;
