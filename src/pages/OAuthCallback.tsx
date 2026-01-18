import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const OAuthCallback = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const error = params.get("error");

    if (token) {
      login(token);
      navigate("/", { replace: true });
    } else if (error) {
      alert(decodeURIComponent(error));
      navigate("/", { replace: true });
    }
  }, []);

  return <div>Đang đăng nhập...</div>;
};

export default OAuthCallback;
