import { NavItem } from "@/types/UIType";
import { NavbarItem } from "./NavbarItem";
import {
    EmployeeHomePageRoute, EmployeeProductPageRoute, EmployeeImportPageRoute,
    EmployeeSellPageRoute, EmployeeSalePageRoute, EmployeeOrderPageRoute,
    OwnerHomePageRoute, OwnerProductPageRoute, OwnerEmployeeManagementPageRoute, OwnerImportPageRoute,
    OwnerSellPageRoute, OwnerSalePageRoute, OwnerOrderPageRoute, OwnerCustomerPageRoute,
} from "@/const/routes";

const employeeNavItems: NavItem[] = [
    { label: "Nhà chính", href: EmployeeHomePageRoute },
    { label: "Sản phẩm", href: EmployeeProductPageRoute },
    { label: "Nhập hàng", href: EmployeeImportPageRoute },
    { label: "Bán hàng", href: EmployeeSellPageRoute },
    { label: "Khuyến mãi", href: EmployeeSalePageRoute, matchNested: true },
    { label: "Đơn hàng", href: EmployeeOrderPageRoute, matchNested: true },
];

const ownerNavItems: NavItem[] = [
    { label: "Nhà chính", href: OwnerHomePageRoute },
    { label: "Sản phẩm", href: OwnerProductPageRoute, matchNested: true },
    { label: "Nhân viên", href: OwnerEmployeeManagementPageRoute, matchNested: true },
    { label: "Nhập hàng", href: OwnerImportPageRoute },
    { label: "Bán hàng", href: OwnerSellPageRoute },
    { label: "Khuyến mãi", href: OwnerSalePageRoute, matchNested: true },
    { label: "Đơn hàng", href: OwnerOrderPageRoute, matchNested: true  },
    { label: "Khách hàng", href: OwnerCustomerPageRoute, matchNested: true  },
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