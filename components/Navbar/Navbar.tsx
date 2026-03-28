import { NavItem } from "@/types/UIType";
import { NavbarItem } from "./NavbarItem";
import {
    EmployeeHomePageRoute, EmployeeProductPageRoute, EmployeeImportPageRoute,
    EmployeeSellPageRoute, EmployeeSalePageRoute, EmployeeOrderPageRoute,
    OwnerHomePageRoute, OwnerProductPageRoute, OwnerEmployeePageRoute, OwnerImportPageRoute,
    OwnerSellPageRoute, OwnerSalePageRoute, OwnerOrderPageRoute, OwnerCustomerPageRoute,
} from "@/const/routes";

const employeeNavItems: NavItem[] = [
    { label: "Nhà chính", href: EmployeeHomePageRoute },
    { label: "Sản phẩm", href: EmployeeProductPageRoute },
    { label: "Nhập hàng", href: EmployeeImportPageRoute },
    { label: "Bán hàng", href: EmployeeSellPageRoute },
    { label: "Khuyến mãi", href: EmployeeSalePageRoute },
    { label: "Đơn hàng", href: EmployeeOrderPageRoute },
];

const ownerNavItems: NavItem[] = [
    { label: "Nhà chính", href: OwnerHomePageRoute },
    { label: "Sản phẩm", href: OwnerProductPageRoute },
    { label: "Nhân viên", href: OwnerEmployeePageRoute },
    { label: "Nhập hàng", href: OwnerImportPageRoute },
    { label: "Bán hàng", href: OwnerSellPageRoute },
    { label: "Khuyến mãi", href: OwnerSalePageRoute },
    { label: "Đơn hàng", href: OwnerOrderPageRoute },
    { label: "Khách hàng", href: OwnerCustomerPageRoute },
];

const navItemsMap: Record<string, NavItem[]> = {
    employee: employeeNavItems,
    owner: ownerNavItems,
};

interface NavbarProps {
    role?: string;
}

export function Navbar({ role }: NavbarProps) {
    const navbarItems = (role ? navItemsMap[role] : null) ?? [];
    
    return (
        <div className="flex items-center gap-x-10">
            {navbarItems.map((item) => (
                <NavbarItem 
                    key={item.label}
                    item={item}
                />
            ))}
        </div>
    )
}