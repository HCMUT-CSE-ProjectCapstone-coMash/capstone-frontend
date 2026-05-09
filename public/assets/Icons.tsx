
interface IconProps {
    width: number,
    height: number,
    className: string
}

export function PhoneIcon({ width, height, className }: IconProps) {
    
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} className={className} viewBox="0 0 20 20" fill="currentColor">
            <path d="M7.50246 2.25722C7.19873 1.4979 6.46332 1 5.64551 1H2.89474C1.8483 1 1 1.8481 1 2.89453C1 11.7892 8.21078 19 17.1055 19C18.1519 19 19 18.1516 19 17.1052L19.0005 14.354C19.0005 13.5361 18.5027 12.8009 17.7434 12.4971L15.1069 11.4429C14.4249 11.1701 13.6483 11.2929 13.0839 11.7632L12.4035 12.3307C11.6089 12.9929 10.4396 12.9402 9.7082 12.2088L7.79222 10.2911C7.06079 9.55962 7.00673 8.39134 7.66895 7.59668L8.23633 6.9163C8.70661 6.35195 8.83049 5.57516 8.55766 4.89309L7.50246 2.25722Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    )
}

export function ClockIcon({ width, height, className }: IconProps) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
    );
}

export function LogoutIcon({ width, height, className }: IconProps) {

    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 18H6V20H18V4H6V6H4V3C4 2.44772 4.44772 2 5 2H19C19.5523 2 20 2.44772 20 3V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V18ZM6 11H13V13H6V16L1 12L6 8V11Z"></path>
        </svg>
    )
}

export function UserIcon({ width, height, className }: IconProps) {

    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 22C4 17.5817 7.58172 14 12 14C16.4183 14 20 17.5817 20 22H18C18 18.6863 15.3137 16 12 16C8.68629 16 6 18.6863 6 22H4ZM12 13C8.685 13 6 10.315 6 7C6 3.685 8.685 1 12 1C15.315 1 18 3.685 18 7C18 10.315 15.315 13 12 13ZM12 11C14.21 11 16 9.21 16 7C16 4.79 14.21 3 12 3C9.79 3 8 4.79 8 7C8 9.21 9.79 11 12 11Z"></path>
        </svg>
    )
}

export function ArrowDownLineIcon({ width, height, className }: IconProps) {

    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 15.0006L7.75732 10.758L9.17154 9.34375L12 12.1722L14.8284 9.34375L16.2426 10.758L12 15.0006Z"></path>
        </svg>
    )
}

export function PencilIcon({ width, height, className }: IconProps) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.8995 6.85453L17.1421 11.0972L7.24264 20.9967H3V16.754L12.8995 6.85453ZM14.3137 5.44032L16.435 3.319C16.8256 2.92848 17.4587 2.92848 17.8492 3.319L20.6777 6.14743C21.0682 6.53795 21.0682 7.17112 20.6777 7.56164L18.5563 9.68296L14.3137 5.44032Z"></path>
        </svg>
    )
}

export function TrashIcon({ width, height, className }: IconProps) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 4V2H17V4H22V6H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V6H2V4H7ZM6 6V20H18V6H6ZM9 9H11V17H9V9ZM13 9H15V17H13V9Z"></path>
        </svg>
    )
}

export function CloseLineIcon({ width, height, className }: IconProps) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.9997 10.5865L16.9495 5.63672L18.3637 7.05093L13.4139 12.0007L18.3637 16.9504L16.9495 18.3646L11.9997 13.4149L7.04996 18.3646L5.63574 16.9504L10.5855 12.0007L5.63574 7.05093L7.04996 5.63672L11.9997 10.5865Z"></path>
        </svg>
    )
}

export function CheckLineIcon({ width, height, className }: IconProps) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M9.9997 15.1709L19.1921 5.97852L20.6063 7.39273L9.9997 17.9993L3.63574 11.6354L5.04996 10.2212L9.9997 15.1709Z"></path>
        </svg>
    )
}

export function SearchIcon({ width, height, className }: IconProps) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
    )
}

export function AddIcon({ width, height, className }: IconProps) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M11 11V5H13V11H19V13H13V19H11V13H5V11H11Z"></path>
        </svg>
    )
}

export function MinusIcon({ width, height, className }: IconProps) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M5 11V13H19V11H5Z"></path>
        </svg>
    )
}

export function UploadIcon({ width, height, className }: IconProps) {

    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12.5858L16.2426 16.8284L14.8284 18.2426L13 16.415V22H11V16.413L9.17157 18.2426L7.75736 16.8284L12 12.5858ZM12 2C15.5934 2 18.5544 4.70761 18.9541 8.19395C21.2858 8.83154 23 10.9656 23 13.5C23 16.3688 20.8036 18.7246 18.0006 18.9776L18.0009 16.9644C19.6966 16.7214 21 15.2629 21 13.5C21 11.567 19.433 10 17.5 10C17.2912 10 17.0867 10.0183 16.8887 10.054C16.9616 9.7142 17 9.36158 17 9C17 6.23858 14.7614 4 12 4C9.23858 4 7 6.23858 7 9C7 9.36158 7.03838 9.7142 7.11205 10.0533C6.91331 10.0183 6.70879 10 6.5 10C4.567 10 3 11.567 3 13.5C3 15.2003 4.21241 16.6174 5.81986 16.934L6.00005 16.9646L6.00039 18.9776C3.19696 18.7252 1 16.3692 1 13.5C1 10.9656 2.71424 8.83154 5.04648 8.19411C5.44561 4.70761 8.40661 2 12 2Z"></path>
        </svg>
    )
}

export function CardIcon({ width, height, className }: IconProps) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="2"/>
            <line x1="2" y1="10" x2="22" y2="10"/>
        </svg>
    );
}

export function BoxIcon({ width, height, className }: IconProps) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
        </svg>
    );
}

export function TrendUpIcon({ width, height, className }: IconProps) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
            <polyline points="17 6 23 6 23 12"/>
        </svg>
    );
}

export function TrendDownIcon({ width, height, className }: IconProps) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
            <polyline points="17 18 23 18 23 12"/>
        </svg>
    );
}

export function OrderIcon({ width, height, className }: IconProps) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
    );
}

export function ProfitIcon({ width, height, className }: IconProps) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23"/>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
    );
}