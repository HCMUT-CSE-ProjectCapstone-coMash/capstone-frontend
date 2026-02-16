import { NavItem } from "@/types/UIType";
import { NavbarItem } from "./NavbarItem";
import { HomePageRoute, ImportPageRoute, OrderPageRoute, ProductPageRoute, SalePageRoute, SellPageRoute } from "@/const/routes";

const navbarItems : NavItem[] = [
    { label: "Nhà chính", href: HomePageRoute },
    { label: "Sản phẩm", href: ProductPageRoute },
    { label: "Nhập hàng", href: ImportPageRoute },
    { label: "Bán hàng", href: SellPageRoute },
    { label: "Khuyến mãi", href: SalePageRoute },
    { label: "Đơn hàng", href: OrderPageRoute },
];

export function Navbar() {

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