import { ContainerPage } from "@/components/container-page";
import { MainLoading } from "./_components/_loading/main";

const Loading = () => {
  return (
    <ContainerPage breadcrumbs={[{ label: "Home" }]}>
      <MainLoading />
    </ContainerPage>
  );
};

export default Loading;
