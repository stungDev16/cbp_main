import { motion } from "framer-motion";
import tw from "@/helpers/tailwind.helper";

function LoadingSystem() {
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
                "fixed inset-0 flex items-center justify-center bg-white z-50 opacity-60 visible",
            )}
            initial="hidden"
            animate={"visible"}
            exit="hidden"
        >
            <motion.div
                className="w-10 h-10 border-4 border-primary border-t-primary border-l-white rounded-full"
                variants={spinnerVariants}
                animate="spin"
            />
        </motion.div>
    );
}

export default LoadingSystem;
