export function variadicArgument(name: string, values?: string[]): string[] {
  if (!values?.length) {
    return [];
  }

  return [
    name,
    values.length.toString(),
    ...values
  ];
}

export function optionalArgument(name: string, value: any): string[] {
  if (value === undefined) {
    return [];
  }

  return [name, value.toString()];
}
