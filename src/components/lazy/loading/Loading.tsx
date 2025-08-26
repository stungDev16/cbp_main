import { motion } from "framer-motion";
import useLoading from "@/context/Loading/hooks/useLoading";
import tw from "@/helpers/tailwind.helper";
import { useUser } from "@/context/user/hooks/useUser";

function Loading() {
  const { loading: loadingUser } = useUser()
  const { loading } = useLoading();

  const spinnerVariants = {
    spin: {
      rotate: 360,
      transition: {
        duration: 1,
        ease: "linear" as const,
        repeat: Infinity,
      },
    },
  };

  return (
    <motion.div
      className={tw(
        "fixed inset-0 flex items-center justify-center bg-primary z-50",
        loading || loadingUser ? "opacity-30 visible" : "opacity-0 invisible"
      )}
      initial="hidden"
      animate={loading || loadingUser ? "visible" : "hidden"}
      exit="hidden"
    >
      <motion.div
        className="w-10 h-10 border-4 border-primary border-t-white border-l-white rounded-full"
        variants={spinnerVariants}
        animate="spin"
      />
    </motion.div>
  );
}

export default Loading;
