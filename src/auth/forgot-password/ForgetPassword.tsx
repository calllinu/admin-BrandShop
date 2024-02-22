import { useState } from 'react';
import { Modal, Form, Input, Button } from 'antd';
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebaseConfig/firebaseConfig";

interface ForgotPasswordModalProps {
  open: boolean;
  onClose: () => void;
}

const ForgotPasswordModal = ({ open, onClose }: ForgotPasswordModalProps) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  const handleResetPassword = async () => {
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      console.log('Password reset email sent successfully!');
    } catch (error) {
      console.error('Error sending password reset email:', (error as Error).message);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <Modal title="Forgot Password" open={open} onCancel={onClose} footer={null}>
      <Form onFinish={handleResetPassword}>
        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, message: 'Please enter your email' }]}
        >
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Reset Password
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ForgotPasswordModal;
