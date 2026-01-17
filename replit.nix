{ pkgs }: {
  deps = [
    pkgs.gh
    pkgs.unzipNLS
    pkgs.stripe-cli
    pkgs.psmisc
    pkgs.imagemagick
    pkgs.dejavu_fonts   # DejaVu-Sans
    pkgs.noto-fonts     # wide glyph coverage
  ];
}
