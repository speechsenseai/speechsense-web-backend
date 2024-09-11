export function sanitazeFilname(filename: string, uuid?: string): string {
  // Extract the file extension
  const extensionIndex = filename.lastIndexOf('.');
  if (extensionIndex === -1) {
    throw new Error('Invalid filename: no extension found');
  }

  const nameWithoutExtension = filename.substring(0, extensionIndex);
  const extension = filename.substring(extensionIndex);

  // Replace all dots in the filename with underscores
  const modifiedName = nameWithoutExtension.replace(/(\.|\/|\?)/g, '_');

  // Append "-abc" to the modified filename
  const finalName = `${modifiedName}${uuid ? `-${uuid}` : ''}${extension}`;

  return finalName;
}
export function extractFilenameWithoutExtension(filename: string): string {
  // Find the position of the last dot in the filename
  const extensionIndex = filename.lastIndexOf('.');
  if (extensionIndex === -1) {
    throw new Error('Invalid filename: no extension found');
  }

  // Extract the filename without the extension
  const nameWithoutExtension = filename.substring(0, extensionIndex);

  return nameWithoutExtension;
}
