import { withPageAccess } from "@/hooks/usePagePermisssions";
import menuKeys from "@/utils/constants/menuKeys";

const DashboardPage = () => {
  return <div>This is a DashboardPage</div>;
};

export default withPageAccess(DashboardPage, menuKeys.DASHBOARD);
