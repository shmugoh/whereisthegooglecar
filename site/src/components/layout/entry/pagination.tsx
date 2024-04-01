import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";

type PaginationProps = {
  length: number;
  activeIndex: number;
};

export function PageNavigation(props: PaginationProps) {
  const previousHref = `?page=${props.activeIndex - 1}`;
  const nextHref = `?page=${props.activeIndex + 1}`;

  return (
    <Pagination>
      <PaginationContent>
        {/* Previous */}
        <PaginationItem>
          <PaginationPrevious href={previousHref} />
        </PaginationItem>

        {/* Items */}
        {Array.from({ length: props.length }, (_, i) => (
          <>
            {/* show the first three */}
            {i < 3 && (
              <PaginationItem key={i}>
                <PaginationLink href="#" isActive={i === props.activeIndex - 1}>
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            )}

            {/* ellipsis once it finishes showing the first three */}
            {i === 3 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            {/* shows last item */}
            {i === props.length - 1 && (
              <PaginationItem key={i}>
                <PaginationLink href="#" isActive={i === props.activeIndex - 1}>
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            )}
          </>
        ))}

        {/* Next */}
        <PaginationItem>
          <PaginationNext href={nextHref} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
