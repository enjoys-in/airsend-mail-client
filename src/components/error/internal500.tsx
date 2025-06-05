import { Button } from '@/components/ui/button';

export default function Error500({ buttonText = "Try Again", onClick }: { onClick?: () => void, buttonText?: string }) {
    return (
        <section>
            <div className="mx-auto max-w-screen-xl px-4 py-8 lg:px-6 lg:py-16">
                <div className="mx-auto max-w-screen-sm text-center">
                    <h1 className="text-primary-600 dark:text-primary-500 mb-4 text-7xl font-extrabold tracking-tight lg:text-9xl">
                        500
                    </h1>
                    <p className="mb-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white md:text-4xl">
                        Internal Server Error.
                    </p>
                    <p className="mb-4 text-lg font-light text-gray-500 dark:text-gray-400">
                        We are already working to solve the problem.{" "}
                    </p>
                    {buttonText && 
                    <div  className="flex justify-center">
                        <Button onClick={onClick} className="text-white">{buttonText}</Button>
                    </div>
                    }

                </div>

            </div>

        </section>
    )
}