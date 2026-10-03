// Wird beim Build vom images-Plugin in build.ts erzeugt
declare module "virtual:images" {
  const images: string[];
  export default images;
}
