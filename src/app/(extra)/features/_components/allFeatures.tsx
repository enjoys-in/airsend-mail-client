import React from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
type Feature = {
    title: string;
    subFeatures?: string[];
};

type FeatureCategory = {
    category: string;
    features: Feature[];
};

type Props = {
    data: FeatureCategory[];
};

const FeaturesList: React.FC<Props> = ({ data }) => {
    return (
        <section className=" py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {data.map((section, idx) => (
                    <div key={idx} className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-200 mb-4">{section.category}</h2>
                        <ul className="space-y-4">
                            {section.features.map((feature, i) => (
                                <li key={i} className="ml-4">
                                    <div className="text-lg font-medium text-gray-400 flex items-start">
                                        <span className="mr-2 mt-1 text-blue-500">✓</span>
                                        {feature.title}
                                    </div>
                                    {feature.subFeatures && (
                                        <ul className="ml-6 mt-1 list-disc text-gray-600 text-sm space-y-1">
                                            {feature.subFeatures.map((sub, j) => (
                                                <li key={j}>{sub}</li>
                                            ))}
                                        </ul>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </section>
        //     <div className="  ">

        //     {data.map((category) => (
        //         <div key={category.category}>
        //             <div className="mb-12">
        //                 <h2 className="text-2xl font-bold text-gray-900 mb-4">{category.category}</h2>
        //             </div>
        //             <div >
        //                 <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        //                     {category.features.map((feature, index) => (
        //                         <Card
        //                             key={index}
        //                             className="overflow-hidden border-none shadow-lg transition-all duration-300 hover:shadow-xl"
        //                         >
        //                             <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
        //                                 <div className="flex items-center gap-3">
        //                                     <div className="rounded-full bg-white/20 p-2">
        //                                         {/* <feature.icon className="h-6 w-6" /> */}
        //                                     </div>
        //                                     <CardTitle className="text-xl">{feature.title}</CardTitle>
        //                                 </div>
        //                                 {/* <CardDescription className="text-white/80 mt-2">{feature.description}</CardDescription> */}
        //                             </CardHeader>
        //                             <CardContent className="p-6">
        //                                 <ul className="space-y-4">
        //                                     {feature?.subFeatures?.map((subFeature, subIndex) => (
        //                                         <li key={subIndex} className="flex items-start gap-3">
        //                                             <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-1.5 mt-0.5">
        //                                                 {/* <subFeature.icon className="h-4 w-4 text-blue-600 dark:text-blue-400" /> */}
        //                                             </div>
        //                                             <div>
        //                                                 <span className="font-medium text-slate-900 dark:text-slate-100">{subFeature}</span>
        //                                             </div>
        //                                         </li>
        //                                     ))}
        //                                 </ul>
        //                             </CardContent>
        //                         </Card>
        //                     ))}
        //                 </div>
        //             </div>
        //         </div>
        //     ))}
        //     <div className="mt-16 text-center">
        //         <Button
        //             asChild
        //             size="lg"
        //             className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
        //         >
        //             <Link href="#" className="px-8 py-6 text-lg">
        //                 Get Started <ChevronRight className="ml-2 h-5 w-5" />
        //             </Link>
        //         </Button>
        //     </div>
        // </div>
    );
};

export default FeaturesList;
