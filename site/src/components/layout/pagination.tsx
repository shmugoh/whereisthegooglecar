import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";

import React from "react";

type PaginationProps = {
  length: number;
  activeIndex: number;
};

export function PageNavigation(props: PaginationProps) {
  const previousHref =
    props.activeIndex !== 1 ? `?page=${props.activeIndex - 1}` : "#";
  const nextHref =
    props.activeIndex !== props.length ? `?page=${props.activeIndex + 1}` : "#";

  return (
    <Pagination>
      <PaginationContent>
        {/* Previous */}
        <PaginationItem>
          <PaginationPrevious href={previousHref} />
        </PaginationItem>

        {/* Items */}
        {Array.from({ length: props.length }, (_, i) => (
          <React.Fragment key={i}>
            {/* show the first three */}
            {i < 3 && (
              <PaginationItem>
                <PaginationLink
                  href={`?page=${i + 1}`}
                  isActive={i === props.activeIndex - 1}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            )}

            {/* ellipsis once activeIndex leaves the first three */}
            {i === 3 && props.activeIndex > 3 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            {/* dynamic pages */}
            {/* only shown if it meets the following conditions: */}
            {i >= props.activeIndex - 1 && // checks if current index is within the activate page or the previous page
              i <= props.activeIndex + 1 && // checks if current index is within the activate page or the next page
              i > 2 && // checks if current index is beyond the first three pages
              i < props.length - 3 && ( // checks if current index is before the last three pages
                <PaginationItem>
                  <PaginationLink
                    href={`?page=${i + 1}`}
                    isActive={i === props.activeIndex - 1}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              )}

            {/* ellipsis before the last three */}
            {i === props.activeIndex + 2 && i < props.length - 3 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            {/* shows last three items */}
            {i >= props.length - 3 && (
              <PaginationItem>
                <PaginationLink
                  href={`?page=${i + 1}`}
                  isActive={i === props.activeIndex - 1}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            )}
          </React.Fragment>
        ))}

        {/* Next */}
        <PaginationItem>
          <PaginationNext href={nextHref} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
