import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface VerifyEmailProps {
  name: string;
  linkVerify: string;
}

const baseUrl = process.env.BASE_URL ? `${process.env.BASE_URL}` : "";

export const VerifyEmail = ({ name, linkVerify }: VerifyEmailProps) => (
  <Html>
    <Head />
    <Tailwind>
      <Body className="mx-auto my-auto bg-gray-200 font-sans max-w-full">
        <Preview>
          Please validate your email address by clicking the button below. Once
          verified, you will be able to log in successfully.
        </Preview>
        <Container className="max-w-3xl w-full h-10" />
        <Container className="bg-white p-10 max-w-3xl w-full mx-auto rounded-md">
          <Img
            src={`${baseUrl}/images/logo-sci.png`}
            width="79"
            height="30"
            alt="SCI"
          />
          <Text className="text-3xl font-bold">Complete your account</Text>
          <Text className="text-sm">
            Hi {name}! Thank you for creating a SCI account. Please validate
            your email address by clicking the button below. Once verified, you
            will be able to log in successfully.
          </Text>
          <Section className="text-center">
            <Button
              className="bg-green-500 text-white rounded-sm text-sm text-center block py-2 px-5 max-w-fit"
              style={{ textDecoration: "none" }}
              href={linkVerify}
            >
              Verify Email
            </Button>
          </Section>
        </Container>
        <Container className="max-w-3xl w-full px-10 py-8">
          <Text className="text-sm my-1">This email was sent by SCI.</Text>
          <Text className="text-gray-500 text-xs my-1">
            470 Noor Ave STE B #1148, South San Francisco, CA 94080
          </Text>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

VerifyEmail.PreviewProps = {
  name: "Alan",
  linkVerify: "https://sci-toko.sro.my.id/verify",
} as VerifyEmailProps;

export default VerifyEmail;
