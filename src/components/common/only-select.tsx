import * as React from "react"
import { cn } from "@/lib/utils"

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
interface GroupOption {
    group: string;
    value: string;
    label: string;
    disabled?: boolean
}

type CustomSelectWithGroups = {
    options: GroupOption[]
    type: "group"
}
type CustomSelect = {
    options: {
        value: string;
        label: string;
        disabled?: boolean
    }[]
    type: "select"
}
type CustomSelectTypes = (CustomSelectWithGroups | CustomSelect) & {
    text: string
    className?: string
    onChange: any
    value: any
    disabled?: boolean

}
export function OnlySelectScrollable({ options, text = "select", type, value, onChange, disabled, className = "w-[325px]" }: CustomSelectTypes) {

    return (
        <Select onValueChange={(val) => onChange(val)} defaultValue={value} disabled={disabled}>
            <SelectTrigger className={cn(" rounded-none", className)} >
                <SelectValue placeholder={`Select  ${text}`} />
            </SelectTrigger>
            <SelectContent>
                {
                    type === "select" ? options.map((option) => (
                        <SelectItem disabled={option?.disabled}
                            key={option.value}
                            value={option.value}
                        >
                            {option.label}
                        </SelectItem>
                    ))
                        : <GroupedItems options={options} />
                }
            </SelectContent>
        </Select>
    )
}

const GroupedItems = ({ options }: { options: GroupOption[] }) => {

    const grouped = options.reduce((acc: Record<string, GroupOption[]>, option) => {
        if (!acc[option.group]) {
            acc[option.group] = [];
        }
        acc[option.group].push(option);
        return acc;
    }, {});

    return (
        <React.Fragment>
            {Object.keys(grouped).map((group) => (
                <SelectGroup key={group}>
                    <SelectLabel>{group}</SelectLabel>
                    {grouped[group].map((option) => (
                        <SelectItem key={option.value} value={option.value} disabled={option?.disabled}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectGroup>
            ))}
        </React.Fragment>
    );
};