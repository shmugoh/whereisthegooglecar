import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
import { Skeleton } from "~/components/ui/skeleton";

import React from "react";

type PaginationProps = {
  length: number;
  activeIndex: number;
};

function PaginationSkeleton() {
  return <Skeleton className="h-10 w-full" />;
}

export function PageNavigation(props: PaginationProps) {
  if (props.length === 0) {
    return <PaginationSkeleton />;
  }

  const previousHref =
    props.activeIndex !== 1 ? `?page=${props.activeIndex - 1}` : "#";
  const nextHref =
    props.activeIndex !== props.length ? `?page=${props.activeIndex + 1}` : "#";

  return (
    <Pagination className="hidden lg:flex">
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

export function MobilePageNavigation(props: PaginationProps) {
  if (props.length === 0) {
    return <></>; // skeleton is already loaded in desktop pagination; too lazy to implement it with the proper css checks
  }

  const previousHref =
    props.activeIndex !== 1 ? `?page=${props.activeIndex - 1}` : "#";
  const nextHref =
    props.activeIndex !== props.length ? `?page=${props.activeIndex + 1}` : "#";

  return (
    <Pagination className="flex lg:hidden">
      <PaginationContent>
        {/* Previous */}
        <PaginationItem>
          <PaginationPrevious href={previousHref} />
        </PaginationItem>

        {/* First Item */}
        <PaginationItem>
          <PaginationLink
            href={`?page=1`}
            isActive={0 === props.activeIndex - 1}
          >
            1
          </PaginationLink>
        </PaginationItem>

        {/* Ellipsis if activeIndex is more than 2 */}
        {props.activeIndex > 2 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {/* Dynamic pages */}
        {Array.from({ length: props.length - 2 }, (_, i) => (
          <React.Fragment key={i}>
            {i === props.activeIndex - 2 && ( // checks if current index is the active page
              <PaginationItem>
                <PaginationLink
                  href={`?page=${i + 2}`}
                  isActive={i === props.activeIndex - 2}
                >
                  {i + 2}
                </PaginationLink>
              </PaginationItem>
            )}
          </React.Fragment>
        ))}

        {/* Ellipsis if activeIndex is less than length - 1 */}
        {props.activeIndex < props.length - 1 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {/* Last Item */}
        <PaginationItem>
          <PaginationLink
            href={`?page=${props.length}`}
            isActive={props.length - 1 === props.activeIndex - 1}
          >
            {props.length}
          </PaginationLink>
        </PaginationItem>

        {/* Next */}
        <PaginationItem>
          <PaginationNext href={nextHref} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
