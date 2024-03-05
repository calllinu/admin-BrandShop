import styles from './sidebar.module.scss';
import { Col, Flex, Row } from 'antd';
import { Link } from 'react-router-dom';
import {
  DashboardOutlined,
  ShoppingOutlined,
  EnvironmentOutlined,
  ShoppingCartOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { auth } from './../firebaseConfig/firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';

function Sidebar() {
  const collections = [
    { label: 'Dashboard', icon: <DashboardOutlined /> },
    { label: 'Orders', icon: <ShoppingCartOutlined /> },
    { label: 'Products', icon: <ShoppingOutlined /> },
    { label: 'Locations', icon: <EnvironmentOutlined /> }
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();

  const handleActive = (index: number) => {
    setActiveIndex((prevIndex) => (index === prevIndex ? -1 : index));
  };

  const handleLogOut = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Error logging out:', (error as Error).message);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser: User | null) => {
      if (!authUser) {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  return (
    <Col span={4} className={styles.leftContainer}>
      <Col className={styles.firstColumn}>
        <Col className={styles.topContainer}>
          <Row className={styles.details}>
            <Flex>
              <Col className={styles.icon}>
                <ShoppingOutlined />
              </Col>
              <Col className={styles.name}>BrandShop</Col>
            </Flex>
          </Row>
          <Col className={styles.items}>
            {collections.map(({ label, icon }, index) => (
              <Link key={label} to={`/${label.toLowerCase()}`}>
                <Row
                  key={label}
                  className={`${index === activeIndex ? styles.active : styles.rows}`}
                  onClick={() => handleActive(index)}
                >
                  <Flex>
                    <Col className={styles.icon}>{icon}</Col>
                    <Col className={styles.collection}>{label}</Col>
                  </Flex>
                </Row>
              </Link>
            ))}
          </Col>
        </Col>
        <Col className={styles.signOut}>
          <Row className={styles.rows} onClick={handleLogOut}>
            <Flex>
              <Col className={styles.icon}>
                <LogoutOutlined />
              </Col>
              <Col className={styles.collection}>Sign Out</Col>
            </Flex>
          </Row>
        </Col>
      </Col>
    </Col>
  );
}

export default Sidebar;
