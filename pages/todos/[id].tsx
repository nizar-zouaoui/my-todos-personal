import type { GetServerSideProps } from "next";

export default function TodoRedirect() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = context.params?.id as string | undefined;
  return {
    redirect: {
      destination: id ? `/todos/task/${id}` : "/todos",
      permanent: false,
    },
  };
};
