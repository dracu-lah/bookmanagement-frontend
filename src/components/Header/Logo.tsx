import routePath from "@/router/routePath";
import { logoImg } from "@/utils/constants/assets";
import { Link } from "react-router";
const Logo = () => {
  return (
    <Link to={routePath.dashboard} className="">
      {/* <img className="w-14 mt-1 md:w-20" src={logoImg} /> */}
      <h1 className="text-3xl font-bold text-primary">BookManagement</h1>
    </Link>
  );
};

export default Logo;
