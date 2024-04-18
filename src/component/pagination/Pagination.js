import _ from "lodash";


export default function Pagination(props) {
    let totalPage = props.totalPage;
    let siblings = props.siblings;
    let limit = props.limit;
    let page = props.page;

    let array = PaginationRange(totalPage, page, limit, siblings)

    return (
        <>
            <div className="pagination-container-bill">
                <select className="select" onChange={(e) => props.onChangeItem(e.target.value)}
                        aria-label="Default select example">
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="15">15</option>
                </select>
                <nav aria-label="Page navigation example">
                    <ul className="pagination">
                        <li className="page-item" >
                            <span onClick={() => props.onPageChange("&laquo;")} className="page-link">&laquo;</span>
                        </li>
                        <li className="page-item">
                            <span className="page-link" onClick={() => props.onPageChange("&lsaquo;")}>&lsaquo;</span>
                        </li>

                        {array.map(value => {
                            if (value === props.page) {
                                return (
                                    <li className="page-item active">
                                        <span className="page-link"
                                              onClick={() => props.onPageChange(value)}>{value}</span>
                                    </li>
                                )
                            } else {
                                return (
                                    <li className="page-item">
                                        <span className="page-link"
                                              onClick={() => props.onPageChange(value)}>{value}</span>
                                    </li>
                                )
                            }
                        })}

                        <li className="page-item">
                            <span className="page-link" onClick={() => props.onPageChange("&rsaquo;")}>&rsaquo;</span>
                        </li>
                        <li className="page-item">
                            <span className="page-link" onClick={() => props.onPageChange("&raquo;")}>&raquo;</span>
                        </li>
                    </ul>
                </nav>
            </div>
        </>
    )
}

export function PaginationRange(totalPage, page, limit, siblings) {
    let totalPageNoInArray = 7 + siblings
    if (totalPageNoInArray >= totalPage) {
        return _.range(1, totalPage + 1)
    }
    let leftSiblingIndex = Math.max(page - siblings, 1)
    let rightSiblingIndex = Math.min(page + siblings, totalPage)

    let showLeftDots = leftSiblingIndex > 2
    let showRightDots = rightSiblingIndex < totalPage - 2

    if (!showLeftDots && showRightDots) {
        let leftItemCount = 3 + 2 * siblings
        let leftRange = _.range(1, leftItemCount + 1)
        return [...leftRange, "... ", totalPage]
    } else if (showLeftDots && !showRightDots) {
        let rightItemCount = 3 + 2 * siblings
        let rightRange = _.range(totalPage - rightItemCount + 1, totalPage + 1)
        return [1, " ...", ...rightRange]
    } else {
        let middleRange = _.range(leftSiblingIndex, rightSiblingIndex + 1)
        return [1, "... ", ...middleRange, " ...", totalPage]
    }
}