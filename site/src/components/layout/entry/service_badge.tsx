import React from "react";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";

export default function ServiceBadge(props: {
  service?: string;
  className?: string;
}) {
  if (props.service) {
    return (
      <Badge variant={"secondary"} className={cn("w-24", props.className)}>
        <p className="w-full text-center">
          {props.service.charAt(0).toUpperCase() + props.service.slice(1)}
        </p>
      </Badge>
    );
  }
}
