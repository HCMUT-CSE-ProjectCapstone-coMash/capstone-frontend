
interface IconProps {
    width: number,
    height: number,
    fill: string
}

export function PhoneIcon({ width, height, fill }: IconProps) {
    
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} fill={fill} viewBox="0 0 20 20">
            <path d="M7.50246 2.25722C7.19873 1.4979 6.46332 1 5.64551 1H2.89474C1.8483 1 1 1.8481 1 2.89453C1 11.7892 8.21078 19 17.1055 19C18.1519 19 19 18.1516 19 17.1052L19.0005 14.354C19.0005 13.5361 18.5027 12.8009 17.7434 12.4971L15.1069 11.4429C14.4249 11.1701 13.6483 11.2929 13.0839 11.7632L12.4035 12.3307C11.6089 12.9929 10.4396 12.9402 9.7082 12.2088L7.79222 10.2911C7.06079 9.55962 7.00673 8.39134 7.66895 7.59668L8.23633 6.9163C8.70661 6.35195 8.83049 5.57516 8.55766 4.89309L7.50246 2.25722Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    )
}

export function LogoutIcon({ width, height, fill }: IconProps) {

    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} fill={fill} viewBox="0 0 24 24">
            <path d="M4 18H6V20H18V4H6V6H4V3C4 2.44772 4.44772 2 5 2H19C19.5523 2 20 2.44772 20 3V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V18ZM6 11H13V13H6V16L1 12L6 8V11Z"></path>
        </svg>
    )
}

export function UserIcon({ width, height, fill }: IconProps) {

    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} fill={fill} viewBox="0 0 24 24">
            <path d="M4 22C4 17.5817 7.58172 14 12 14C16.4183 14 20 17.5817 20 22H18C18 18.6863 15.3137 16 12 16C8.68629 16 6 18.6863 6 22H4ZM12 13C8.685 13 6 10.315 6 7C6 3.685 8.685 1 12 1C15.315 1 18 3.685 18 7C18 10.315 15.315 13 12 13ZM12 11C14.21 11 16 9.21 16 7C16 4.79 14.21 3 12 3C9.79 3 8 4.79 8 7C8 9.21 9.79 11 12 11Z"></path>
        </svg>
    )
}

export function ArrowDownLineIcon({ width, height, fill }: IconProps) {

    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} fill={fill} viewBox="0 0 24 24">
            <path d="M12 15.0006L7.75732 10.758L9.17154 9.34375L12 12.1722L14.8284 9.34375L16.2426 10.758L12 15.0006Z"></path>
        </svg>
    )
}