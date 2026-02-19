import { TableProps } from "@/types/UIType";

export function Table<T>({ columns, data, isLoading = false }: TableProps<T>) {

    return (
        <table className="w-full border-collapse">
            <thead>
                <tr className="border-b">
                    {columns.map((column, index) => (
                        <th key={index} className="text-m font-medium p-4">
                            {column.title}
                        </th>
                    ))}
                </tr>
            </thead>

            <tbody>
                {isLoading ? (
                    <tr>
                        <td colSpan={columns.length} className="p-6 text-center">
                            Đang tải dữ liệu...
                        </td>
                    </tr>
                ) : data.length === 0 ? (
                    <tr>
                        <td colSpan={columns.length} className="p-6 text-center">
                            Không có dữ liệu.    
                        </td>
                    </tr>
                ) : (
                    <>
                        {data.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {columns.map((column, colIndex) => (
                                    <td key={colIndex} className="p-4 text-center border-b border-gray-500">
                                        {column.render ? column.render(row) : [column.key]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </>
                )}
            </tbody>
        </table>
    );
}