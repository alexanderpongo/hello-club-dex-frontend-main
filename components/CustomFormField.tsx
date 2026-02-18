'use client';
import React from 'react';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Control } from 'react-hook-form';
import Image from 'next/image';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { DateTimePicker } from './ui/datetime-picker';

export enum FormFieldType {
  INPUT = 'input',
  TEXTAREA = 'textarea',
  PHONE_INPUT = 'phoneInput',
  CHECKBOX = 'checkbox',
  DATE_PICKER = 'datePicker',
  SELECT = 'select',
  SKELETON = 'skeleton',
  DATE_TIME_PICKER = 'dateTimePicker',
}

interface CustomProps {
  control: Control<any>;
  fieldType: FormFieldType;
  name: string;
  label?: string;
  type?: 'number' | 'password' | 'text' | 'email';
  placeholder?: string;
  iconSrc?: string;
  iconAlt?: string;
  disabled?: boolean;
  dateFormat?: string;
  showTimeSelect?: boolean;
  children?: React.ReactNode;
  renderSkeleton?: (field: any) => React.ReactNode;
}

const RenderField = ({ field, props }: { field: any; props: CustomProps }) => {
  const {
    fieldType,
    name,
    label,
    type,
    placeholder,
    iconSrc,
    iconAlt,
    disabled,
    dateFormat,
    showTimeSelect,
    children,
    renderSkeleton,
  } = props;

  switch (fieldType) {
    case FormFieldType.INPUT:
      return (
        <div className="flex">
          {iconSrc && (
            <Image
              src={iconSrc}
              height={24}
              width={24}
              alt={iconAlt || 'icon'}
              className="ml-2"
            />
          )}
          <FormControl>
            <Input
              placeholder={placeholder}
              {...field}
              type={type}
              className="input-primary"
            />
          </FormControl>
        </div>
      );
    // case FormFieldType.PHONE_INPUT:
    //   return (
    //     <FormControl>
    //       <PhoneInput
    //         defaultCountry="LK"
    //         placeholder={placeholder}
    //         international
    //         withCountryCallingCode
    //         value={field.value as E164Number | undefined}
    //         onChange={field.onChange}
    //         className="input-phone"
    //       />
    //     </FormControl>
    //   );
    case FormFieldType.DATE_TIME_PICKER:
      return (
        <FormControl>
          <DateTimePicker
            placeholder={placeholder}
            {...field}
            className="input-primary"
          />
        </FormControl>
      );
    case FormFieldType.SKELETON:
      return renderSkeleton ? renderSkeleton(field) : null;
    case FormFieldType.SELECT:
      return (
        <FormControl>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger className="input-primary">
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="card-primary">{children}</SelectContent>
          </Select>
        </FormControl>
      );
    case FormFieldType.TEXTAREA:
      return (
        <FormControl>
          <Textarea
            placeholder={placeholder}
            {...field}
            className="input-primary"
            disabled={disabled}
          />
        </FormControl>
      );
    case FormFieldType.CHECKBOX:
      return (
        <FormControl>
          <div className="flex items-center gap-4">
            <Checkbox
              id={props.name}
              checked={field.value}
              onCheckedChange={field.onChange}
              className="rounded-xs text-dark"
            />
            <label htmlFor={props.name} className="checkbox-label">
              {label}
            </label>
          </div>
        </FormControl>
      );
    default:
      break;
  }
};

const CustomFormField = (props: CustomProps) => {
  const {
    control,
    fieldType,
    name,
    label,
    placeholder,
    iconSrc,
    iconAlt,
    disabled,
    dateFormat,
    showTimeSelect,
    children,
    renderSkeleton,
  } = props;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex-1">
          {fieldType !== FormFieldType.CHECKBOX && label && (
            <FormLabel>{label}</FormLabel>
          )}

          <RenderField field={field} props={props} />

          <FormMessage className="shad-error" />
        </FormItem>
      )}
    />
  );
};

export default CustomFormField;
