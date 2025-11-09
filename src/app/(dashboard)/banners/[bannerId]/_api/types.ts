export type BannerProps = {
  name: string;
  imageOld: string;
  apply: string;
  selected: string[];
  startAt: string;
  endAt: string | undefined;
  isEnd: boolean;
  status: string;
};

export type ShowBannerResponse = {
  data: BannerProps;
};

export type UpdateBannerBody = FormData;

export type UpdateBannerParams = {
  id: string;
};
