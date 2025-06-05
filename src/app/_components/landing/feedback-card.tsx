import {
  Card,
  CardContent, 
} from "@/components/ui/card"
 

export const FeedbackCard = ({  fullname, text }:any) => {
  return (
    <Card className="w-full">
      <CardContent className="flex flex-col items-start space-y-3 px-4 pt-3 pb-6 md:space-y-4 md:px-6 md:pt-4 md:pb-8">
        <div className="flex items-center space-x-4 md:space-x-8 w-full">
         
          <div className="flex flex-col items-start">
            <h1 className="text-base md:text-lg font-semibold dark:text-neutral-200">{fullname}</h1>
          </div>
        </div>
        <div>
          <p className="text-sm md:text-base">{text}</p>
        </div>
      </CardContent>
    </Card>
  );
};