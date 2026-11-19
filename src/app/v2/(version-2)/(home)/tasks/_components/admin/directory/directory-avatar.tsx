import { Avatar, AvatarFallback, AvatarImage } from "@tasks/_components/ui/avatar";
import { cn } from "@tasks/_lib/cn";
import { getInitials } from "@tasks/_lib/get-initials";

type DirectoryAvatarProps = {
  name: string;
  image: string | null | undefined;
  className?: string;
};

export function DirectoryAvatar({
  name,
  image,
  className,
}: DirectoryAvatarProps) {
  return (
    <Avatar className={cn("size-7 border bg-muted", className)}>
      {image ? <AvatarImage src={image} alt={name} /> : null}
      <AvatarFallback className="text-[10px] font-semibold">
        {getInitials(name, "?")}
      </AvatarFallback>
    </Avatar>
  );
}
