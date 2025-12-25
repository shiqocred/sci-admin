import { ContainerPage } from "@/components/container-page";
import { ParamsLoading } from "../_components/_loading/params";

const Loading = () => {
  return (
    <ContainerPage
      breadcrumbs={[
        { label: "Home", url: "/" },
        { label: "Banners", url: "/banners" },
        { label: "Edit" },
      ]}
    >
      <ParamsLoading mode="edit" />
    </ContainerPage>
  );
};
export default Loading;
