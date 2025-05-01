import Authcard from "@/components/auth/authcard";
import VerifyMailForm from "@/components/auth/verifyMail-form";

function VerifyMail() {
  return (
    <Authcard header='Verifying mail..'>
      <VerifyMailForm />
    </Authcard>
  );
}

export default VerifyMail;
